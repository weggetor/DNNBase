import { Injectable } from '@angular/core';

@Injectable()

export class ClientSettingsProvider {
    public baseUrl: string = "http://oundeconnector.rounde.de";
    public dnnPortal: string = "0";
    public appTitle: string = "Grupp Direkt";
    public appVersion: string = "2.0.0";
}
