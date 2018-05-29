export interface JwtToken {
    userId: number;
    displayName: string;
    accessToken: string;
    renewalToken: string;
    payload: {
        sid: string,
        role: string[],
        iss: string,
        exp: number,
        nbf: number
    }
}
