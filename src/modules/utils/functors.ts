import config from 'config';

const {uname, passwd} = config.get('credentials.login') as {uname: string; passwd: string};

export function getUriEncodedCredentials(){
    return encodeURI(`data[User][username]=${uname}&data[User][password]=${passwd}`)
}
