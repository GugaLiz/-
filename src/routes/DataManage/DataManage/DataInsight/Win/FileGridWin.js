import React,{Component} from 'react';
import {Modal,Tabs,Table} from 'antd';
import moment from 'moment';

const TabPane = Tabs.TabPane;

export default class FileGridWin extends Component{
  state = {
    netType: [
      { Value: '0', Text: 'GSM' },
      // {Value:'1',Icon:Tdscdma,Text:'Tdscdma'},
      { Value: '2', Text: 'WCDMA' },
      { Value: '3', Text: 'TDSCDMA' },
      { Value: '7', Text: 'LTE' },
    ],
  };

  render(){
    const {modalVisible} = this.props;
    const okHandle = () =>{
      console.log('xx')
    };

    const columns = [{
      title:"项目",
      dataIndex:'GroupName',

    },{
      title:"设备名称",
      dataIndex:'DeviceName',

    },{
      title:"文件名",
      dataIndex:'FileName',

    },{
      title:"端口",
      dataIndex:'Port',

    },{
      title:"数据业务",
      dataIndex:'TestSummary',

    },{
      title:"数据网络",
      dataIndex:'DataNetTypes',
      render:(v) => {
        let netType = this.state.netType;
        if(v){
          let vv = [];
          netType.map((item) => {if(v.indexOf(item.Value) > -1){vv.push(item.Text)}});
          let h = vv.join(',');
          return h;
        }
        return v;
      }

    },{
      title:"运营商",
      dataIndex:'OperatorName',

    },{
      title:"测试时间",
      dataIndex:'BeginDT',
      render:(v,rec) => {
        let bt = moment(v).format('YYYY-MM-DD HH:mm:ss');
        let v2 = rec.data.EndDT;
        let et = moment(v2).format('YYYY-MM-DD HH:mm:ss')
        return bt + "~" + et;
    }
    }];

    return (
      <Modal width="70%"
                   title="添加数据"
                   visible = {modalVisible}
                   onOk = {okHandle}
                   onCancel = {
                     () => this.props.handleFileGridVisible()
                   }
    >
      <Tabs type="card" onChange={this.changeKey}>
        <TabPane tab="选择文件" key="1">
          <Table size="small"
                 columns={columns}
          />
        </TabPane>

      </Tabs>
    </Modal>
    )
  }

}
