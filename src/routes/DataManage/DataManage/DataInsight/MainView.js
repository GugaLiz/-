import React,{Component,Fragment} from 'react';
import {Layout,Menu,Icon,Button} from 'antd';

import MapPnl from './Map/MapPnl';
import LeftPnl from './Left/LeftPnl';
import ParamPanel from './Bottom/ParamPanel';

const { Sider, Content } = Layout;

export default class DataInsight extends Component{

  state = {
    datas:null,
    hidPageViewSetting:null,
    hidData:null,
    momtData:null,
    hidNetworkTpl:null,
    hidParamSetting:null,
    _IsDDIB:false,
  };

  componentDidMount = () => {
    let id = 2840;
    let file = null;
    let url = '/api/DataInsight/GetIndex';
    fetch(`${url}/${id}`,{
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
       //console.info(respData.datas[0].PageViewSetting);
        console.info(respData.datas[0].Data.FileName);
       this.setState({
         datas:respData.datas[0],
         hidPageViewSetting:respData.datas[0].PageViewSetting,
         hidData:respData.datas[0].Data,
         momtData:respData.datas[0].MOMTData,
         hidNetworkTpl:respData.datas[0].NetworkTpl,
         hidParamSetting:respData.datas[0].ParamData,
       });

      })
      .catch((error) => {
        console.log(error);
      });
  };

  render(){
    const h = window.innerHeight - 64;

    const parentMethods = {
      datas:this.state.datas,
      fileData:this.state.hidData,
      paramSetting:this.state.hidParamSetting

    };

    return (
      <Layout>
        <Sider
          width='250px'
        >
          <LeftPnl {...parentMethods} />
        </Sider>
        <Content>
          <MapPnl  />
          <ParamPanel />
        </Content>
      </Layout>
    )
  }

}
