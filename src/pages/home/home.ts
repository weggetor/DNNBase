import { JwtToken } from './../../models/jwttoken.interface';
import { AuthService } from './../../providers/auth.service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  token: JwtToken;
  secretKey: string;

  constructor(public navCtrl: NavController, public authService: AuthService) {
    authService.token.then((value) => this.token = value);
  }

  get expireDate() {
      if (this.token)
        return new Date(this.token.payload.exp * 1000);
    else
        return null;
  }

  get tokenDate() {
    if (this.token)
      return new Date(this.token.payload.nbf * 1000);
  else
      return null;
}


}
