import { AppUser } from './../models/appuser.interface';
// https://www.joshmorony.com/creating-role-based-authentication-with-passport-in-ionic-2-part-2/

import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import * as sha1 from 'js-sha1';

import { JwtToken } from './../models/jwttoken.interface';
import { ClientSettingsProvider } from "./clientsettings";

@Injectable()
export class AuthService {

    private _token: JwtToken;
    private _isAuthenticated: boolean;

    @Output() onAuthStateChanged: EventEmitter<any> = new EventEmitter();

    constructor(public http: Http,
        public storage: Storage, 
        private settings: ClientSettingsProvider) {

        this._isAuthenticated = false;
    }

    checkAuthentication() {
        console.log("Starte Authentifizierung")
        return new Promise((resolve, reject) => {
            this.storage.get('token')
                .then((value: JwtToken) => {
                    if (value) {
                        console.log("Token gefunden: " + JSON.stringify(value));
                        // check first validity date + 15 Minuten arrived ?
                        const exp = new Date(value.payload.exp * 1000 + (15 * 60000));
                        if (exp < new Date()) {
                            const message = "Token ist abgelaufen";
                            console.log(message)
                            this.onAuthStateChanged.emit(null);
                            this._isAuthenticated = false;
                            this._token = null;
                            reject(message);
                        } else {
                            const url = this.settings.baseUrl + '/DesktopModules/JwtAuth/API/mobile/testget'
                            this._token = value;
                            let headers = new Headers();
                            headers.append('Authorization', "Bearer " + this._token.accessToken);
                            let options = new RequestOptions({ headers: headers });
                            console.log("Starte Tokenüberprüfung über Website " + url);
                            this.http.get(url, options).subscribe(
                                res => {
                                    console.log("Token ist gültig");
                                    this.onAuthStateChanged.emit(value);
                                    this._isAuthenticated = true;
                                    resolve(res);
                                },
                                err => {
                                    console.log("Token ist NICHT gültig"  + JSON.stringify(err));
                                    this.onAuthStateChanged.emit(null);
                                    this._isAuthenticated = false;
                                    this._token = null;
                                    reject(err);
                                });
                        }
                    } else {
                        const message = "Kein Token gefunden";
                        console.log(message)
                        this.onAuthStateChanged.emit(null);
                        this._isAuthenticated = false;
                        this._token = null;
                        reject(message);
                    }
                })
                .catch((err) => {
                    const message =  "Fehler beim lesen des Token: " + JSON.stringify(err);
                    console.log(message);
                    this.onAuthStateChanged.emit(null);
                    this._isAuthenticated = false;
                    this._token = null;
                    reject(err);
                });
        });
    }

    login(user: string, password: string) {
        return new Promise<JwtToken>((resolve, reject) => {

            const credentials = { u: user, p: password };
            //console.log("Login Versuch auf Url " + url + ' mit User: ' + user + ' und Passwort:' + password);

            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const url = this.settings.baseUrl + '/DesktopModules/JwtAuth/API/mobile/login';
            
            
            this.http.post(url, credentials, { headers: headers })
                .subscribe(res => {
                    console.log("Login Response" + JSON.stringify(res));
                    this._token = res.json();
                    this._token.payload = JSON.parse(window.atob(this._token.accessToken.split('.')[1]));
                    this.storage.set('token', this._token);
                    this.storage.set('credentials', credentials);
                    this.onAuthStateChanged.emit(this._token);
                    this._isAuthenticated = true;
                    resolve(this._token);
                }, (err) => {
                    console.log("Login Error:" + JSON.stringify(err));
                    this.onAuthStateChanged.emit(null);
                    this.storage.remove('token');
                    this.storage.remove('credentials');
                    this._isAuthenticated = false;
                    reject(err);
                });
        });

    }

    register(user:string, email: string, password:string) {

        this.logout();

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const dateIn = new Date();
        const dateString = String(10000 * dateIn.getUTCFullYear() + 100 * (dateIn.getUTCMonth()+1) + dateIn.getUTCDate());
        const secretKey = sha1(user + password + dateString);

        const newUser: AppUser =  {
            UserName: user,
            FirstName : '',
            LastName : '',
            DisplayName : user,
            Email: email,
            Password: password,
            Secret: secretKey
        }

        const url = this.settings.baseUrl + '/DesktopModules/BBStore/API/App/registeruser';
        console.log('POST data: ',JSON.stringify(newUser));

        return this.http.post(url, newUser, {headers: headers}).toPromise();
    }

    relogin() {
        return new Promise<JwtToken>((resolve, reject) => {
            this.storage.get('credentials')
                .then ((value) => {
                    this.login(value.u,value.p)
                        .then((token) => resolve(token))
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    console.log("Relogin fehlgeschlagen. Keine Credentials gespeichert!")
                    this.onAuthStateChanged.emit(null);
                    this._isAuthenticated = false;
                    reject(err);
                })
        })
    }

    logout() {
        this.storage.remove('token');
        this.storage.remove('credentials');
        this.onAuthStateChanged.emit(null);
        this._isAuthenticated = false;
    }

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    get token() {
        return new Promise<JwtToken>((resolve, reject) => {
            this.storage.get('token')
                .then ((value) => {
                    resolve( value);
                })
                .catch((err) => {
                    reject(err);
                })
        
        })
    }
}
