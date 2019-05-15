import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Table, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, 
} from 'antd';
import moment, { now } from 'moment';
import styles from './AlarmEventForm.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 

@connect(({ airfleet, loading }) => ({
    airfleet,
    loading: loading.models.airfleet,
  }))
export default class AlarmPnl extends PureComponent {
    state = {
        AlarmLevelArray: [
            { Value: -1, Color: 'green', Text: '清除' }, 
            { Value: 0, Color: 'purple', Text: '提示' },
            { Value: 1, Color: '#FFE800', Text: '次要' },
            { Value: 2, Color: 'orange', Text: '重要' },
            { Value: 3, Color: 'red', Text: '紧急' }]
    }

     //切换table页
     changePage =(pageNum)=>{
        this.props.getPageNum(2,pageNum);
    }

    setTxtColor = (val,rec) => {
        const alarmLevalArr = this.state.AlarmLevelArray;
             let color ='';
             for (let i=0;i<alarmLevalArr.length;i++){
                 let model = alarmLevalArr[i];
                 if(model.Value == rec.Level){
                     color = model.Color;
                     break;
                 }
             }
        return <span style={{color:color}}>{val}</span>
    }

  render() {
      const {alarmList,deviceLists} = this.props;
     //console.log(alarmList)
      let data =[];
      let total = 0;
      if(alarmList){
         data = alarmList.data;
        //  if(data){
        //     for(let i = 0;i<deviceLists.length;i++){
        //         let devList = deviceLists[i];
   
        //         for(let j =0 ;j<data.length;j++){
        //            let d = data[j];
        //            if(d.Device == devList.DeviceId){
        //                d.Name = devList.Name+'-P'+d.Port;
        //            }
        //         }
        //     }
        //  }
         
          total = alarmList.total;
      }
      //console.log(deviceLists)
    const alarmTitle = (
      <div style={{display:'flex',marginBottom:'-1em'}}> <p>告警名称</p>
        <p>(</p>
      <p style={{color:'green',padding:'0px 5px'}}>清除</p>
      <p style={{color:'purple',padding:'0px 5px'}}>提示</p>
      <p style={{color:'#FFE800',padding:'0px 5px'}}>次要</p>
      <p style={{color:'orange',padding:'0px 5px'}}>重要</p>
      <p style={{color:'red',padding:'0px 5px'}}>紧急</p>
        <p>)</p>
    </div>);
    const columns =[{
        title:'设备端口',
        dataIndex:'Name',
        key:'port',
        width:'80px',
        render:(val,rec) => this.setTxtColor(val,rec)
    },
    // {
    //     title:'级别',
    //     dataIndex:'Level',
    //     key:'leval',
    //     width:'34px',   
        
    // },
    {
        title:'告警时间',
        dataIndex:'AlarmDT',
        key:'time',
        width:'85px',
        render:(val,rec) => {
            let v = moment(val).format('HH:mm:ss');
           const alarmLevalArr = this.state.AlarmLevelArray;
             let color ='';
             for (let i=0;i<alarmLevalArr.length;i++){
                 let model = alarmLevalArr[i];
                 if(model.Value == rec.Level){
                     color = model.Color;
                     break;
                 }
             }
        return <span style={{color:color}}>{v}</span>
         }
    },{
        title:alarmTitle,
        dataIndex:'Content',
        key:'name',
        render:(val,rec) => this.setTxtColor(val,rec)
    }];

    const height = window.innerHeight;
      const styleTable = {
        height:height-100
      }

      const paginationProps = {
        onChange:this.changePage,
        total:total,
        size:"small",
        pageSize:50,
        showQuickJumper: true,
        showTotal:(total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`
      };
    
    return (
        <Card style={{height:height-100}}  bordered={false} >
        <Table size="small"
        //bordered
        style={styleTable}
        scroll={{y:height-140}}
        columns={columns} 
        dataSource={data}
        pagination={paginationProps}
        />
        </Card>
   
    );
  }
}
