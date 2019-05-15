import React,{Component,Fragment} from 'react';
import { connect } from 'dva';
import styles from './MainView.less';
import {Card,Dropdown,Button,Divider} from 'antd';
import StandardTable from 'components/StandardTable';
import moment from 'moment';

@connect(({dataManage,loading}) => ({
  dataManage,
    loading:loading.models.dataManage,
}))

export default  class DataManage extends Component{
  state = {
    DataType:[{Value: '0',Text: 'DT' },
      {Value: '1',Text: 'Indoor' },
      {Value:'2',Text:'VIP'},
      {Value:'5',Text:'AHCQT'}],
    DeviceType:[{Value: '0',Text: 'RCU' },
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
      {Value:'11',Text:'CTU'}],
    Status:[{Value: '0',Color:'Red',Text: '失败' },
      {Value: '1',Color:'Gray',Text: '等待' },
      {Value: '2',Color:'Blue',Text: '解码中' },
      {Value: '3',Color:'Blue',Text: '预处理' },
      {Value: '4',Color:'Green',Text: '完成' },
      {Value: '5',Color:'Gray',Text: '上传中' },
      {Value: '6',Color:'Gray',Text: '已合并' }
    ],
    AnalyzeStatus:[{Value: '0',Color:'Gray',Text: '等待' },
      {Value: '1',Color:'Blue',Text: '进行中' },
      {Value: '2',Color:'Blue',Text: '进行中' },
      {Value: '3',Color:'Red',Text: '失败' },
      {Value: '4',Color:'Green',Text: '完成' },
      {Value: '5',Color:'Red',Text: '失败' }
      ],
    data:[{AbnormalCh:"GPS丢失: 测试里程 <= 100m & 测试里程 <= 100m;",
      AbnormalEn: "File Exceptions(Distance): TotalDistance <= 100m & TotalDistance <= 100m;",
      Begindt: "/Date(1550001288000)/",
      BuildingID: 0,
      BuildingName
        :
        null,
      CreateDT
        :
        "/Date(1550157664000)/",
      Creator
        :
        "admin",
      DataType
        :
        0,
      DecodeFileCount
        :
        1,
      DeviceGUID
        :
        null,
      DeviceID
        :
        0,
      DeviceName
        :
        null,
      DeviceType
        :
        0,
      Enddt
        :
        "/Date(1550003624000)/",
      FileName
        :
        "0173140320190212195445ms4.lte",
      FilePort
        :
        null,
      FileSize
        :
        "195.81  MB ",
      GroupName
        :
        "lltest",
      GroupType
        :
        0,
      HaveOtherFile
        :
        false,
      ID
        :
        2841,
      IsAbnormal
        :
        1,
      LegalSeq
        :
        null,
      PointName
        :
        null,
      Status
        :
        4,
      Tag
        :
        {"Vendor":"Dingli","DeviceType":"RCU","TagProtocol":"Dingli","TestType":"DT","TestScenario":"Driveway"},
      Tag1
        :
        null,
      Tag2
        :
        null,
      Tag3
        :
        null,
      TestPointID
        :
        null,
      ValidateResult
        :
        0,
    }],
    selectedRows:[]
  };

  // componentDidMount = () => {
  //   const formData = {
  //     start: 0,
  //     limit: 25,
  //     deviceId:'',
  //     groupId: 0,
  //   deviceType:'',
  //     ValidateResult:'',
  //       beginDT: '2019-02-07',
  //   endDT: '2019-02-14 23:59:59'
  //   };
  //   const formDataStr = JSON.stringify(formData);
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type:'dataManage/getListSource',
  //     payload:formData
  //   });
  // };

  handleSelectRows = () => {

  };

  handleStandardTableChange = () => {

  };

  handleUpdateModalVisible = () => {

  };

  render(){
    const columns = [{
      title: '组',
      dataIndex: 'GroupName',
      key: 'GroupName',
    },{
      title: '设备/测试点',
      dataIndex: 'DeviceName',
      key: 'DeviceAndTP',
      // render:(val,rec)=>{
      //   let data = rec.data;
      //   console.info(data);
      //   let names = data.DeviceName;
      //   if(names == '' || names == null){
      //     names = data.BuildingName;
      //   }else if(data.BuildingName != ''
      //     && data.BuildingName != null) {
      //     names += "/" + data.BuildingName;
      //   }
      //   return names;
      // }
    },{
      title: '文件名称',
      dataIndex: 'FileName',
      key: 'FileName',
    },{
      title: '文件大小',
      dataIndex: 'FileSize',
      key: 'FileSize',
    },{
      title: '测试类型',
      dataIndex: 'DataType',
      key: 'DataType',
      render:(val) => {
        if(val == null){
          return '-';
        }else{
          let qryRtn = this.state.DataType;
          if(qryRtn != null && qryRtn.length > 0){
            qryRtn.map((item) => {if(item.Value == val){val = item.Text}});
          }

          return val;
        }
      }
    },{
      title: '设备类型',
      dataIndex: 'DeviceType',
      key: 'DeviceType',
      render:(val) => {
        if(val == null){
          return '-';
        }else{
          let qryDtn = this.state.DeviceType;
          if(qryDtn != null && qryDtn.length > 0){
            qryDtn.map((item) => {if(item.Value == val){val = item.Text}});
          }

          return val;
        }
      }
    },{
      title: '上传时间',
      dataIndex: 'CreateDT',
      key: 'CreateDT',
      render:(val) => {
        val = moment(val).format('YYYY-MM-DD HH:mm:ss');
        return val;

      }
    },{
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render:(val) => {
        let status = this.state.Status;
        let txt = '';
        let color = '';
        if(status != null && status.length > 0){
          status.map((item) => {if(item.Value == val){txt = item.Text;color = item.Color;}})
        }
        return <p style = {{color:`${color}`}}>{txt}</p>
      }
    },{
      title: '校验',
      dataIndex: 'IsAbnormal',
      key: 'IsAbnormal',
      render:(val) => {
        if(val == 0){
          return <p style = {{color:'green'}}>有效</p>
        }else if(val == 1){
          return <p style = {{color:'red'}}>无效</p>
        }else{
          return <p style = {{color:'black'}}>未校验</p>
        }
      }
    },{
      title: '操作',
      key: 'Operation',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>解码信息</a>
          <Divider type="vertical" />
          <a href="">下载</a>
          <Divider type="vertical" />
          <a href={'#/dataManage/dataInsight'}>回放</a>
          <Divider type="vertical" />
          <a href="">重解码</a>
        </Fragment>
      ),
    }];

    //const data =

    return (
      <Card bordered={false}>
      <div className={styles.tableList}>

        <StandardTable
          selectedRows={this.state.selectedRows}
          //loading={loading}
          //data={data}
          data = {this.state.data}
          columns={columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
        />
      </div>
    </Card>
    )
  }


}
