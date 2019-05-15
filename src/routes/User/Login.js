import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    _starttime:(new Date()).getTime(),
    type: 'account',
    rememberLogin: false,
  };

  componentDidMount = () => {
    var me = this;
    let time = (new Date()).getTime();
    console.info(time)
    me.setState({
      _starttime: time
    })
  };

  onTabChange = type => {
    this.setState({ type });
  };

  /* convert integer to hex string */

  hex = (i) => {
    let sHex = "0123456789ABCDEF";
    let h = "";
    for (let j = 0; j <= 3; j++) {
      h += sHex.charAt((i >> (j * 8 + 4)) & 0x0F) +
        sHex.charAt((i >> (j * 8)) & 0x0F);
    }
    return h;
  };

  /* add, handling overflows correctly */
  add = (x, y) => {
    return ((x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)) ^ (x & 0x80000000) ^ (y & 0x80000000);
  };

  /*  rounds functions */
   R1 = (A, B, C, D, X, S, T) => {
     let me = this;
     let q = me.add(me.add(A, (B & C) | (~B & D)), me.add(X, T));
    return me.add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
  };

   R2 = (A, B, C, D, X, S, T) => {
     let me = this;
     let add = me.add;
    let q = add(add(A, (B & D) | (C & ~D)), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
  };

   R3 = (A, B, C, D, X, S, T) => {
     let me = this;
     let add = me.add;
    let q = add(add(A, B ^ C ^ D), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
  };

   R4 = (A, B, C, D, X, S, T) => {
     let me = this;
     let add = me.add;
    let q = add(add(A, C ^ (B | ~D)), add(X, T));
    return add((q << S) | ((q >> (32 - S)) & (Math.pow(2, S) - 1)), B);
  };

  /* main entry point */
 calcD5 = (sInp) => {
   let me = this;
   if(sInp && sInp.length > 0){
     let R1 = me.R1;
     let R2 = me.R2;
     let R3 = me.R3;
     let R4 = me.R4;
     /* to convert strings to a list of ascii values */
     let  sAscii = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ"
     sAscii = sAscii + "[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";


     /* Calculate length in machine words, including padding */
     let wLen = (((sInp.length + 8) >> 6) + 1) << 4;
     let X = new Array(wLen);

     /* Convert string to array of words */
     let j = 4;
     let i = 0;
     for (i = 0; (i * 4) < sInp.length; i++) {
       X[i] = 0;
       for (j = 0; (j < 4) && ((j + i * 4) < sInp.length); j++) {
         X[i] += (sAscii.indexOf(sInp.charAt((i * 4) + j)) + 32) << (j * 8);
       }
     }

     /* Append padding bits and length */
     if (j == 4) {
       X[i++] = 0x80;
     }
     else {
       X[i - 1] += 0x80 << (j * 8);
     }
     for (; i < wLen; i++) {
       X[i] = 0;
     }
     X[wLen - 2] = sInp.length * 8;

     /* hard-coded initial values */
     let a = 0x67452301;
     let b = 0xefcdab89;
     let c = 0x98badcfe;
     let d = 0x10325476;

     /* Process each 16-word block in turn */
     for (let i = 0; i < wLen; i += 16) {
       let aO = a;
       let bO = b;
       let cO = c;
       let dO = d;

       a = R1(a, b, c, d, X[i + 0], 7, 0xd76aa478);
       d = R1(d, a, b, c, X[i + 1], 12, 0xe8c7b756);
       c = R1(c, d, a, b, X[i + 2], 17, 0x242070db);
       b = R1(b, c, d, a, X[i + 3], 22, 0xc1bdceee);
       a = R1(a, b, c, d, X[i + 4], 7, 0xf57c0faf);
       d = R1(d, a, b, c, X[i + 5], 12, 0x4787c62a);
       c = R1(c, d, a, b, X[i + 6], 17, 0xa8304613);
       b = R1(b, c, d, a, X[i + 7], 22, 0xfd469501);
       a = R1(a, b, c, d, X[i + 8], 7, 0x698098d8);
       d = R1(d, a, b, c, X[i + 9], 12, 0x8b44f7af);
       c = R1(c, d, a, b, X[i + 10], 17, 0xffff5bb1);
       b = R1(b, c, d, a, X[i + 11], 22, 0x895cd7be);
       a = R1(a, b, c, d, X[i + 12], 7, 0x6b901122);
       d = R1(d, a, b, c, X[i + 13], 12, 0xfd987193);
       c = R1(c, d, a, b, X[i + 14], 17, 0xa679438e);
       b = R1(b, c, d, a, X[i + 15], 22, 0x49b40821);

       a = R2(a, b, c, d, X[i + 1], 5, 0xf61e2562);
       d = R2(d, a, b, c, X[i + 6], 9, 0xc040b340);
       c = R2(c, d, a, b, X[i + 11], 14, 0x265e5a51);
       b = R2(b, c, d, a, X[i + 0], 20, 0xe9b6c7aa);
       a = R2(a, b, c, d, X[i + 5], 5, 0xd62f105d);
       d = R2(d, a, b, c, X[i + 10], 9, 0x2441453);
       c = R2(c, d, a, b, X[i + 15], 14, 0xd8a1e681);
       b = R2(b, c, d, a, X[i + 4], 20, 0xe7d3fbc8);
       a = R2(a, b, c, d, X[i + 9], 5, 0x21e1cde6);
       d = R2(d, a, b, c, X[i + 14], 9, 0xc33707d6);
       c = R2(c, d, a, b, X[i + 3], 14, 0xf4d50d87);
       b = R2(b, c, d, a, X[i + 8], 20, 0x455a14ed);
       a = R2(a, b, c, d, X[i + 13], 5, 0xa9e3e905);
       d = R2(d, a, b, c, X[i + 2], 9, 0xfcefa3f8);
       c = R2(c, d, a, b, X[i + 7], 14, 0x676f02d9);
       b = R2(b, c, d, a, X[i + 12], 20, 0x8d2a4c8a);

       a = R3(a, b, c, d, X[i + 5], 4, 0xfffa3942);
       d = R3(d, a, b, c, X[i + 8], 11, 0x8771f681);
       c = R3(c, d, a, b, X[i + 11], 16, 0x6d9d6122);
       b = R3(b, c, d, a, X[i + 14], 23, 0xfde5380c);
       a = R3(a, b, c, d, X[i + 1], 4, 0xa4beea44);
       d = R3(d, a, b, c, X[i + 4], 11, 0x4bdecfa9);
       c = R3(c, d, a, b, X[i + 7], 16, 0xf6bb4b60);
       b = R3(b, c, d, a, X[i + 10], 23, 0xbebfbc70);
       a = R3(a, b, c, d, X[i + 13], 4, 0x289b7ec6);
       d = R3(d, a, b, c, X[i + 0], 11, 0xeaa127fa);
       c = R3(c, d, a, b, X[i + 3], 16, 0xd4ef3085);
       b = R3(b, c, d, a, X[i + 6], 23, 0x4881d05);
       a = R3(a, b, c, d, X[i + 9], 4, 0xd9d4d039);
       d = R3(d, a, b, c, X[i + 12], 11, 0xe6db99e5);
       c = R3(c, d, a, b, X[i + 15], 16, 0x1fa27cf8);
       b = R3(b, c, d, a, X[i + 2], 23, 0xc4ac5665);

       a = R4(a, b, c, d, X[i + 0], 6, 0xf4292244);
       d = R4(d, a, b, c, X[i + 7], 10, 0x432aff97);
       c = R4(c, d, a, b, X[i + 14], 15, 0xab9423a7);
       b = R4(b, c, d, a, X[i + 5], 21, 0xfc93a039);
       a = R4(a, b, c, d, X[i + 12], 6, 0x655b59c3);
       d = R4(d, a, b, c, X[i + 3], 10, 0x8f0ccc92);
       c = R4(c, d, a, b, X[i + 10], 15, 0xffeff47d);
       b = R4(b, c, d, a, X[i + 1], 21, 0x85845dd1);
       a = R4(a, b, c, d, X[i + 8], 6, 0x6fa87e4f);
       d = R4(d, a, b, c, X[i + 15], 10, 0xfe2ce6e0);
       c = R4(c, d, a, b, X[i + 6], 15, 0xa3014314);
       b = R4(b, c, d, a, X[i + 13], 21, 0x4e0811a1);
       a = R4(a, b, c, d, X[i + 4], 6, 0xf7537e82);
       d = R4(d, a, b, c, X[i + 11], 10, 0xbd3af235);
       c = R4(c, d, a, b, X[i + 2], 15, 0x2ad7d2bb);
       b = R4(b, c, d, a, X[i + 9], 21, 0xeb86d391);

       a = me.add(a, aO);
       b = me.add(b, bO);
       c = me.add(c, cO);
       d = me.add(d, dO);
     }

     return me.hex(a) + me.hex(b) + me.hex(c) + me.hex(d);

   }

  };

  rot13 = (str) => {
    let arr = [];
    for(let i = 0;i<str.length;i++){
      let cc = parseInt(str[i]);
      if(cc >= 65 && cc<= 77){
        arr.push(cc - 64 + 90 - 13);
      }else if(cc > 77 && cc <= 90){
        arr.push(cc - 13);
      }else{
        arr.push(cc);
      }
    }

    let newStr = "";
    for(let j = 0;j<arr.length;j++){
      newStr += arr[j];
    }
    return newStr;

  };

  handleSubmit = (err, values) => {
    let me = this;
    let starttime = me.state._startttime;
    console.info(starttime)
    let t = (new Date() .getTime()) - starttime;
    let tt = (new Date() .getTime()) + t;
    if(values){
      console.info(values);
      let pswd = values.pdw;
      let tt2 = me.calcD5(pswd).toLowerCase();
      pswd = me.calcD5(tt2 + tt2.substr(11,7) + tt2);
      values.pdw = pswd;

    }
    //values.t = tt;
    let aq = JSON.stringify(values);
    let q = window.btoa(aq);
    let txt = 'eyJyZW1vdmVMb2dnZWQiOiJmYWxzZSIsInVzZXJBY2NvdW50IjoiYWRtaW4iLCJwZHciOiIzQjg0ODJEMEM3QzRGRkZCRDI3MEY2OTUwQ0M1MjRGQSIsInZlcmlmaWNhdGlvbkNvZGUiOiIifQ==';
    const { type } = this.state;
      me.props.dispatch({
        type: 'login/login',
        payload: {
          txt
        },
      });

    //console.info(typeof(q));
    //let aq = me.rot13(window.btoa(q));
    //console.info(window.btoa(q),values,aq);

    // let url = '/api/Signin/Check/';
    // fetch(url , {
    //   credentials: 'include',
    //   method: 'POST',
    //   // headers: {
    //   //   'Content-Type': 'application/x-www-form-urlencoded',
    //   // },
    //   body: 'q=' + window.btoa(q),
    //   // params: {
    //   //   q: window.btoa(q)
    //   // },
    //
    // })
    //   .then((resp) => resp.json())
    //   .then((respData) => {
    //     // console.log('respData');
    //     console.info(respData);
    //
    //   })
    //   .catch((error) => {
    //      console.log(error);
    //   });
    // const { type } = this.state;
    // if (!err) {
    //   this.props.dispatch({
    //     type: 'login/login',
    //     payload: {
    //       ...values,
    //       type,
    //     },
    //   });
    // }
  };

  changeAutoLogin = e => {
    this.setState({
      rememberLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <div className={styles.account}>
            {login.status === 'error' &&
            login.type === 'account' &&
            !submitting &&
            this.renderMessage('账户或密码错误')}
            <UserName name="userAccount" placeholder="请输入账号" />
            <Password name="pdw" placeholder="请输入密码" />
          </div>
          {/*<Tab key="account" tab="账户密码登录">*/}
            {/**/}
          {/*</Tab>*/}
          {/*<Tab key="mobile" tab="手机号登录">*/}
            {/*{login.status === 'error' &&*/}
              {/*login.type === 'mobile' &&*/}
              {/*!submitting &&*/}
              {/*this.renderMessage('验证码错误')}*/}
            {/*<Mobile name="mobile" />*/}
            {/*<Captcha name="captcha" />*/}
          {/*</Tab>*/}
          <div>
            <Checkbox checked={this.state.rememberLogin} onChange={this.changeAutoLogin}>
              自动登录
            </Checkbox>
            <a style={{ float: 'right' }} href="">
              忘记密码
            </a>
          </div>
          <Submit loading={submitting}>登录</Submit>
          {/*<div className={styles.other}>*/}
            {/*其他登录方式*/}
            {/*<Icon className={styles.icon} type="alipay-circle" />*/}
            {/*<Icon className={styles.icon} type="taobao-circle" />*/}
            {/*<Icon className={styles.icon} type="weibo-circle" />*/}
            {/*<Link className={styles.register} to="/user/register">*/}
              {/*注册账户*/}
            {/*</Link>*/}
          {/*</div>*/}
        </Login>
      </div>
    );
  }
}
