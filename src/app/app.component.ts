import { JwtToken } from './../models/jwttoken.interface';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav, Platform, LoadingController, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthService } from '../providers/auth.service';


@Component({
    templateUrl: 'app.html'
})
export class MyApp implements OnInit {

    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;
    loginPage = LoginPage;

    isAuthenticated: boolean = false;
    token:JwtToken;
    roles: string[];


    constructor(public platform: Platform,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        private authService: AuthService,
        private loadingCtrl: LoadingController,
        private menuCtrl: MenuController) {
    }


    ngOnInit() {
        this.platform.ready().then(() => {

            this.statusBar.styleDefault();
            this.splashScreen.hide();

            this.authService.onAuthStateChanged.subscribe(token => {
                if (token) {
                    this.isAuthenticated = true;
                    this.rootPage = HomePage;
                    this.roles = token.payload.role;
                    this.token = token;
                } else {
                    this.isAuthenticated = false;
                    this.rootPage = LoginPage;
                    this.roles = []
                    this.token = null;
                }
            })

            const authLoading = this.loadingCtrl.create({ content: 'Überprüfe Authentifizierung...' });
            authLoading.present();
            this.authService.checkAuthentication()
                .then(() => authLoading.dismiss())
                .catch(() => {
                    this.authService.relogin()
                        .then(() => authLoading.dismiss())
                        .catch(() => {
                            authLoading.dismiss();
                            this.nav.setRoot(LoginPage);
                        })
                });

        })

    };


    onLoad(page: any, params?: any) {
        this.nav.setRoot(page, params);
        this.menuCtrl.close();
    }

    onLogout() {
        this.authService.logout();
        this.nav.setRoot(LoginPage);
        this.menuCtrl.close();
    }
}
