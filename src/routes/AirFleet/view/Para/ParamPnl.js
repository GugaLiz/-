import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tooltip, Icon, Button, Table, Input,Popconfirm,Form ,Menu,Dropdown} from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';
import numeral from 'numeral';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import styles from './ParamPnl.less';
import SelectPortModal from './SelectPortModal';
import SelectParamModal from './SelectParamModal';
import ParaHistoryModal from './ParaHistoryModal';
//图标引入
import MyIcon from 'components/MyIcon';

const FormItem = Form.Item;
const { Sider, Content } = Layout;

export default class ParamPnl extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      selectPortModalVisible: false,
      selectParamModalVisible: false,
      selectParaHistoryModal:false,
      paraList: [],
      paraSelectData:[],
      portsList: [],
      devicePort: [],
      isChecked: true,
      id4Paras: [],//存储Id4Para数据包含{"Id":5,"Port":"5","Para":[2131099649,2131099662,2131099663]} 选择端口的时候填写Id、Port  Para选择参数时加入
      //  selectedPortRowKeys: [],
      // selectedPortRows: [],
      selectedParas: [],//选择的参数
      columns: [{
        title: '设备端口',
        dataIndex: 'Name',
        key: 'port',
       width: '210px',
        render: (val, rec) => {
          let v = rec.Name + '-P' + rec.PortNum;
          return v;
        },
      }, {
        title: '操作',
        key:'operation',
        width: '30px',
        render: (val, rec) => {
          return <span onClick={this.handleRemovePort.bind(this, rec.DeviceId, rec.PortNum)}><MyIcon
            iconName={'remove'}/></span>;
        },
      }],
      historyTitle:'',
      historyDatas:null,
      record:{},
      param:{},
    };
  }

  //请求选择端口数据
  fetctPortsSelect = (type) => {
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/DevicePortList/';
    let deviceIds = this.props.deviceIds;
    let dataPara = this.props._dataPara;

    //如果用户没有选择设备就不用去查询端口
    if (!deviceIds || deviceIds.length <= 0) {
      return;
    }
    let ids = [];
    if (deviceIds) {
      ids = JSON.stringify(deviceIds);
    }

    let isChecked = this.state.isChecked;
    if (type == 2) {
      isChecked = !this.state.isChecked;
    }
    fetch(url + '?_dc=' + dc, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'cond={"DeviceTypes":[],"DeviceIds":' + ids + ',"NotDisplayZero":' + isChecked + '}',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        let data = respData.data;
        //处理数据
        let idsVal = deviceIds;
        let tables = [];
        if (idsVal && idsVal.length > 0) {
          for (let i = 0; i < idsVal.length; i++) {
            let id = idsVal[i];
            let table = [];
            let devName = '';
            let portNums = 0;
            for (let j = 0; j < data.length; j++) {
              let devId = data[j].DeviceId;
              if (devId === id) {
                data[j].key = data[j].DeviceId + '_' + data[j].PortNum;
                table.push(data[j]);
                devName = data[j].Name;
              }
            }//end for
            if (table && table.length > 0) {
              portNums = table.length;
              //  table.key = i;
              //table.tableName = devName;
              //table.portNums = portNums;
              let headRow = '设备名称：' + devName + '（' + portNums + 'Ports）';
              table.splice(0, 0, { GroupName: headRow });
              tables = tables.concat(table);
            }//end if
          }//end for
          //把每个数组进行遍历 每个开头插入一个行，整合到一个数组中
          // console.log('设备端口数据处理后输出:');
          // console.log('portsList:');
          // console.info(tables);
        }//end if
        //放入到一个一个数组中，开始前加入一个 （设备名称：Name（端口总和Ports））
        this.setState({ portsList: tables });
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  selectPortModal = (flag) => {
    this.setState({
      selectPortModalVisible: !!flag,
    });


    this.fetctPortsSelect(1);
  };

  //请求选择参数数据
  fetctParaSelect = (netType) => {
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/ParaList/';
    fetch(url + '?_dc=' + dc, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'netType=' + netType,

    })
      .then((resp) => resp.json())
      .then((respData) => {
        //要把这个paraList进行处理 加入key
        // console.log('respData');
        // console.info(respData);
        if (respData.datas) {
          for (let i = 0; i < respData.datas.length; i++) {
            var dataItem = respData.datas[i];
            dataItem.key = dataItem.Id;
          }
        }
        this.setState({ paraList: respData , paraSelectData:respData});
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  selectParamModal = (flag) => {
    this.setState({
      selectParamModalVisible: !!flag,
    });

    this.fetctParaSelect(-1);
  };

  getPorts = (selectedRowsData) => {
    //请求参数arr
    let id4Paras = [];
    //去除head元素
    for (let i = 0; i < selectedRowsData.length; i++) {
      let item = selectedRowsData[i];
      if (item.GroupName) {
        selectedRowsData.splice(i, 1);
      } else {
        let id4Para = { Id: item.DeviceId, Port: item.PortNum };
        id4Paras.push(id4Para);
      }
    }
    // console.log('getPorts this');
    // console.info(this);

    //this.props.onSetReqBodyUrl(id4Paras);
    this.setState({
      devicePort: selectedRowsData,
      id4Paras: id4Paras,
      //  selectedPortRowKeys: selectedRowKeys,
      //  selectedPortRows: selectedRowsData,
    });

    // console.log('getPorts:');
    // console.log('selectedRows:');
    // console.info(selectedRowsData);
    // console.log('id4Paras:');
    // console.info(this.state.id4Paras);
    let d = this.state.data;
    if (selectedRowsData && selectedRowsData.length > 0) {
      for (let i = 0; i < selectedRowsData.length; i++) {
        let name = selectedRowsData[i].Name + '-P' + selectedRowsData[i].PortNum;
        d.push(name);
      }
      this.setState({
        data: d,
      });
    }
  };
//设置getDatas请求参数
  setReqBodyUrl = (selectedRowsData) => {
    let paraArr = [];
    for (let i = 0; i < selectedRowsData.length; i++) {
      let item = selectedRowsData[i];
      paraArr.push(item.Code);
    }
    //每个设备端口加入参数数组
    let id4Paras = this.state.id4Paras;
    if (id4Paras.length > 0) {
      for (let i = 0; i < id4Paras.length; i++) {
        let id4ParaItem = id4Paras[i];
        id4ParaItem.Para = paraArr;
      }
      this.setState({
        id4Paras: id4Paras,
      });
      //组织这样的请求参数 Id4Paras[{"Id":5,"Port":[2131099649,2131099662]},....]
      let oldReqBodyUrl = this.props.oldReqBodyUrl;
      oldReqBodyUrl.Id4Paras = id4Paras;
      this.props.onSetReqBodyUrl(oldReqBodyUrl);
    }
    // console.log('id4Paras:');
    // console.info(id4Paras);
  };

  //单元格右键操作
  onChangeMenu = (val) => {
    let key = val.key;
    let rec = val.item.props.value;
    let param = val.item.props.param;
    if(key === "1"){
      //map_set_para_overlay
      let paramConfig = this.state.selectedParas;
      this.props.map_set_para_overlay(paramConfig,rec,param);

    }else if(key === "2"){
      //todo:①fetchHistory②show grid
     this.fetchHistory(rec,param,1);
      //显示历史数据面板
      this.handleParaHistoryVisible();
    }
  };

  setVal = (rec,param) => {
    this.setState({
      record:rec,
      param:param
    });
  };
  //fetchHistory
  fetchHistory = (rec,param,pageNum) => {
    this.setVal(rec,param);
    let deviceName = rec.Name;
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/GetParamHistory/';
    let deviceId = rec.DeviceId;
    let port = rec.PortNum;
    let paramName = param.Name;
    let paramId = param.Code;
    let page = pageNum;
    let limit = 100;
    let start = (page-1) * limit;

    let historyTitle = deviceName + '-P' + port + '-' + paramName;
    this.setState({
      historyTitle:historyTitle
    });
    fetch(url +'?deviceId='+deviceId+'&port='+port+'&paramId='+paramId+'&_dc='+dc+'&page='+page+'&start='+start+'&limit='+limit, {
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        // console.log(respData);
        if(! respData.summary){
          respData.summary = {
            Avg: '-',
            Max: '-',
            Min: '-'
          }
        }
        respData.paramName = paramName;
        this.setState({
          historyDatas:respData
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //把用户选的参数加入到列中
  setParamColumn = (selectedRowsData) => {
    const columns = [{
      title: '设备端口',
      dataIndex: 'Name',
      key: 'port',
      width: '210px',
      render: (val, rec) => {
        let v = rec.Name + '-P' + rec.PortNum;
        return v;
      },
    }, {
      title: '操作',
      key:'operation',
      width: '30px',
      render: (val, rec) => {
        return <span onClick={this.handleRemovePort.bind(this, rec.DeviceId, rec.PortNum)}><MyIcon
          iconName={'remove'}/></span>;
      },
    }];

    for (let i = 0; i < selectedRowsData.length; i++) {
      columns.push({
        title: selectedRowsData[i].Name,
        dataIndex:'DeviceId',
        //dataIndex:selectedRowsData[i].Code,
        key:selectedRowsData[i].Code,
        //width:'50px',
        render:(val, rec) => {
          let v = '-';
          let sto = this.state.portsList;
          let code = selectedRowsData[i].Code;
          let paras  = rec.Paras;
          if(paras){
            if(paras[code]){
              v = paras[code].V;
            }
          }
          if (v === "" || typeof v == 'undefined') {
            v = '-';
          } else {
            v = parseFloat(v);
            if (isNaN(v)) v = '-';
            if (typeof v === 'number') {
              v = v.toFixed(2);
            }
           }
          const rightMenuText = (
            <Menu onClick={this.onChangeMenu}>
              <Menu.Item key="1" value={rec} param = {selectedRowsData[i]}>覆盖`{selectedRowsData[i].Name}`到地图上</Menu.Item>
              <Menu.Item key="2" value={rec} param = {selectedRowsData[i]}>查看`{selectedRowsData[i].Name}`历史列表</Menu.Item>
            </Menu>
          );
          return (<Dropdown overlay={rightMenuText} trigger={['contextMenu']}>
            <span>{v}</span>
          </Dropdown>)
        }
      });
    }
    this.setState({
      columns: columns,
    });
  };

  //或者子类中传来的params数据
  getParams = (selectedRowsData) => {
    //设置请求getdatas时的参数
    this.setReqBodyUrl(selectedRowsData);
    //把用户选的参数加入到列中
    this.setParamColumn(selectedRowsData);
    this.setState({
      selectedParas: selectedRowsData,
    });
  };

  //选择端口的0端口是否选中
  changeCheck = () => {
    this.setState({
      isChecked: !this.state.isChecked,
    });
    this.fetctPortsSelect(2);
  };

  close = () => {
    this.props.paramPnl();
  };
  /*
  * 列表中移除端口
  * */
  handleRemovePort = (deviceId, portNum) => {
    let devicePortArr = this.state.devicePort;
    for (let i = 0; i < devicePortArr.length; i++) {
      let devicePort = devicePortArr[i];
      if (devicePort.DeviceId === deviceId && devicePort.PortNum === portNum) {
        devicePortArr.splice(i, 1);
        break;
      }
    }
    // console.log('执行删除后devicePortArr:');
    // console.info(devicePortArr);
    /*
    *   selectedPortRowKeys: selectedRowKeys,
        selectedPortRows: selectedRows,
    * */
    /*
    let oldSelectedPortRowKeys = this.state.selectedPortRowKeys;
    for (let i = 0; i < oldSelectedPortRowKeys.length; i++) {
      let oldSelectedPortRowKey = oldSelectedPortRowKeys[i];
      if (oldSelectedPortRowKey.DeviceId === DeviceId) {
        oldSelectedPortRowKeys.splice(i, 1);
        break;
      }
    }

    let oldSelectedPortRows = this.state.selectedPortRows;
    for (let i = 0; i < oldSelectedPortRows.length; i++) {
      let oldSelectedPortRow = oldSelectedPortRows[i];
      if (oldSelectedPortRow.DeviceId === DeviceId) {
        oldSelectedPortRows.splice(i, 1);
        break;
      }
    }
    */
    this.setState({
      devicePort: devicePortArr,
      //  selectedPortRowKeys: oldSelectedPortRowKeys,
      //  selectedPortRows: oldSelectedPortRows,
    });
  };

  handleParaHistoryVisible = () => {
    let visible = this.state.selectParaHistoryModal;
    this.setState({
      selectParaHistoryModal:!visible
    });
  };

  getPageNum = (pageNum) => {
    let rec = this.state.record;
    let param = this.state.param;
    this.fetchHistory(rec,param,pageNum);
  };


  position = (rec) => {
    this.props.posdevice(rec);
  };

  updateData = (datas) => {
    let me = this;
    let sto = me.state.devicePort;
    if (!sto) {
      return;
    }
   datas.map( (data) => {
      let deviceId = data.DeviceId;
      let port = data.Port;
      let id = deviceId.toString() + '_' + port.toString();
      if (data.Paras) {
        let rec = '';
        sto.map((item) => {if(item._id === id){item.Paras = data.Paras}});

      }
    });
  };
  render() {
    const { paramPnlVisible, paramPnl, detailData, deviceIds } = this.props;
    const display = paramPnlVisible ? 'block' : 'none';
    const height = window.innerHeight * 0.4;
    const { selectedParas } = this.state;
    let data = this.state.data;
    const styleCard = {
      display:display,
      height: height,
    };

    const parentMethods = {
      fetchPara: this.fetctParaSelect,
      paraList: this.state.paraList,
      paraSelectData:this.state.paraSelectData,
      portsList: this.state.portsList,
      getPorts: this.getPorts.bind(this),
      getParams: this.getParams.bind(this),
      deviceIds: this.props.deviceIds,
      isChecked: this.state.isChecked,
      changeCheck: this.changeCheck,
      handleParaHistoryVisible:this.handleParaHistoryVisible,
      historyTitle:this.state.historyTitle,
      historyDatas:this.state.historyDatas,
      getPageNum:this.getPageNum,
     position:this.position
    };

    return (
      <Content style={styleCard}>
        <ChartCard
          style={{ height: height }}
          bordered={true}
          title="参数"
          action={
            <Tooltip title="">
              <Icon type="close" onClick={this.close}/>
            </Tooltip>
          }
          footer={<Table size="small"
                         bordered={true}
                        //scroll={{ y: height - 132 }}
                         scroll={{y:150}}
                         columns={this.state.columns}
                         dataSource={this.state.devicePort}
                         pagination={false}
          />}
          contentHeight={35}
        >
          <Trend>
            <Button size="small" style={{ marginRight: '5px' }} onClick={this.selectPortModal}>
              <MyIcon iconName={'s_port'}/>选择端口
            </Button>
            <Button size="small" onClick={this.selectParamModal}>
              <MyIcon iconName={'s_param'}/>选择参数
            </Button>
          </Trend>
        </ChartCard>
        <SelectPortModal
          {...parentMethods}
          modalVisible={this.state.selectPortModalVisible}
          selectPortModal={this.selectPortModal}
          //  selectedPortRowKeys={this.state.selectedPortRowKeys}
          // selectedPortRows={this.state.selectedPortRows}
        />
        <SelectParamModal
          {...parentMethods}
          modalVisible={this.state.selectParamModalVisible}
          selectParamModal={this.selectParamModal}
        />

        <ParaHistoryModal
          {...parentMethods}
          modalVisible={this.state.selectParaHistoryModal}
          selectParaHistoryModal = {this.selectParaHistoryModal}
        />
      </Content>
    );
  }
}
