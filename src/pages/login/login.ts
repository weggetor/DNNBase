import { AuthService } from './../../providers/auth.service';
import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { HomePage } from '../home/home';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage {

    //Defaults
    login_form: any;
    register_form: any;
    show_hide_icon = 'md-eye';
    password_input_type = 'password';

    // Password max Length, can be changed here
    password_min_length = 7;
    user_min_length = 2;

    // Set the active tab, can be either 'login' || 'register'
    login_type = 'login';



    constructor(public navCtrl: NavController,
        private formBuilder: FormBuilder,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private authService: AuthService ) {
        // declare the login form
        this.login_form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.minLength(this.password_min_length), Validators.required]],
        });
        // declare the register form
        this.register_form = this.formBuilder.group({
            username: ['', [Validators.minLength(this.user_min_length), Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(this.password_min_length), Validators.required]],
        });
    }

    // Called when the user clicks on the show/hide password icon
    showHidePass() {

        // invoke change detection
        setTimeout(() => {

            // either show password or hide password
            if (this.show_hide_icon == 'md-eye') {
                this.show_hide_icon = 'md-eye-off';
                this.password_input_type = 'text';
            }
            else {
                this.show_hide_icon = 'md-eye';
                this.password_input_type = 'password';
            }

        }, 0);
    }

    // Called when user clicks register button
    register() {
        let loader = this.loadingCtrl.create({ spinner: "dots" });
        loader.present().then(done => {

            this.authService.register(this.register_form.value.username, this.register_form.value.email, this.register_form.value.password)
                .then(data => {
                    loader.dismiss();
                    const alert = this.alertCtrl.create({
                        title: 'Registrierung erfolgreich!',
                        message: 'Willkommen !',
                        buttons: ['Ok']
                    });
                    alert.present();
                    this.authService.login(this.register_form.value.username, this.register_form.value.password)
                        .then(() => this.navCtrl.setRoot(HomePage))
                        .catch(() => this.navCtrl.setRoot(HomePage));
                })
                .catch(error => {
                    loader.dismiss();
                    const alert = this.alertCtrl.create({
                        title: 'Registrierung fehlgeschlagen!',
                        message: error.message,
                        buttons: ['Ok']
                    });
                    alert.present();
                });
        })
    }

    // Called when user clicks login button
    login() {
        let loader = this.loadingCtrl.create({ spinner: "dots" });
        loader.present().then(done => {

            this.authService.login(this.login_form.value.username, this.login_form.value.password)
                .then(data => {
                    loader.dismiss();
                    const alert = this.alertCtrl.create({
                        title: 'Login erfolgreich!',
                        message: 'Willkommen zurück ' + data.displayName + '!',
                        buttons: ['Ok']
                    });
                    alert.present();
                    this.navCtrl.setRoot(HomePage);
                })
                .catch(error => {
                    loader.dismiss();
                    const alert = this.alertCtrl.create({
                        title: 'Login fehlgeschlagen!',
                        message: error.message,
                        buttons: ['Ok']
                    });
                    alert.present();
                });
        })
    }

    //Called when user clicks on forgot password text
    forgotPassword() {

        //Create the alert message with an email for the user to enter thier email. 
        let alert = this.alertCtrl.create({
            inputs: [{
                name: 'email',
                type: 'email'
            }],
            title: "Please enter your email",
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => { console.log('Cancel clicked'); }
                },
                {
                    text: 'Forgot Password',
                    handler: data => {
                        console.log('Forgot password clicked. email is ' + data.email);

                        // Call to the api would usually happen now.
                    }
                }
            ]

        });

        //now show the alert
        alert.present();
    }
}
