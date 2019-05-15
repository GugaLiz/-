import React, { PureComponent } from 'react';

class Common extends PureComponent{
  state = {
    DataType:[{Value: '0',Text: 'DT' },
      {Value: '1',Text: 'Indoor' },
      {Value:'2',Text:'VIP'},
      {Value:'5',Text:'AHCQT'}],
    DeviceType:[{Value: '0',Text: 'Rcu' },
      {Value: '1',Text: 'ATU' },
      {Value:'2',Text:'Walktour'},
      {Value: '3',Text: 'Scout' },
      {Value:'4',Text:'VIP'},
      {Value:'5',Text:'Pioneer'},
      {Value: '6',Text: 'WalktourPack' },
      {Value: '7',Text: 'Indoor_ATU' },
      {Value:'8',Text:'Scout2_0'},
      {Value: '9',Text: 'RCU_Light' },
      {Value:'10',Text:'BTU'},
      {Value:'11',Text:'CTU'}]
  }

}

export default Common;
