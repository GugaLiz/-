import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout,Tooltip,Icon,Button,Table,Radio,Form,Input,Row,Col,Checkbox,InputNumber,Card ,Modal} from 'antd';
import MyIcon from 'components/MyIcon';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import moment, { now } from 'moment';
export default class ParaHistoryModal extends Component {

  //切换table页
  changePage =(pageNum)=>{
    this.props.getPageNum(pageNum);
  };
//定位
  position = (rec) => {
    this.props.position(rec);
  };
  render(){
    const {modalVisible,historyTitle,historyDatas} = this.props;
    let total = 0;
    let data = [];
    let summary = {};
    let max = '-';
    let min = '-';
    let avg = '-';
    let paramName = '';
    if(historyDatas !== null){
      total = historyDatas.total;
      data = historyDatas.data;
      summary = historyDatas.summary;
      if(summary.Count > 0){
        max = (summary.Max).toFixed(2);
        min = (summary.Min).toFixed(2);
        avg = (summary.Avg).toFixed(2);
      }
      paramName = historyDatas.paramName;
    }

    const columns = [{
      title:'参数名称',
      dataIndex: 'ParamName',
      key:'ParaName',
      width:'71px',
      render:()=>{
        return paramName;
      }
    },{
      title:'参数值',
      dataIndex: 'Value',
      key:'ParaValueText',
      width:'68px',
      render:(val,rec) => {
        if(val){
          return val;
        }else{
          return '-'
        }
      }
    },{
      title:'时间',
      dataIndex: 'Time',
      key:'TimeText',
      width:'132px',
      render:(val,rec) => {
        let v = moment(val).format('YYYY-MM-DD HH:mm:ss');
        return <span >{v}</span>
      }
    },{
      title:'经度',
      dataIndex: 'X',
      key:'CurrentLngText',
      width:'90px',
      render:(val,rec) => {
        if(val){
          return val;
        }else{
          return '-'
        }
      }
    },{
      title:'纬度',
      dataIndex: 'Y',
      key:'CurrentLatText',
      width:'90px',
      render:(val,rec) => {
        if(val){
          return val;
        }else{
          return '-'
        }
      }
    },{
      title: '定位',
      key: 'location',
      width: '45px',
      render: (val, record, index) => {
        if (record.Lat && record.Lng) //有gps
        {
          return <a name="remove" onClick={() => this.position(record)}><MyIcon
            iconName={'pos'}/></a>;
        }
        return <a name="remove" onClick={() => this.position(record)}><MyIcon
          iconName={'noPos'}/></a>;
      }
    }]

    const paginationProps = {
      onChange:this.changePage,
      total:total,
      size:"small",
      pageSize:100,
      showQuickJumper: true,
      showTotal:(total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`
    };

    return(
      <Modal title={historyTitle} width='70%'
             visible = {modalVisible}
             footer={null}
             onCancel={
               () => this.props.handleParaHistoryVisible()
             }
      >
        <ChartCard style={{padding:'0px'}}
                   bordered={false}
                   footer={
                     <Table size="small"
                            scroll={{ y: 300 }}
                            columns={columns}
                           dataSource={data}
                           pagination={paginationProps}
                     />
                   }
                   contentHeight={16}
        >
          <Trend>
            <span style={{display:'flex'}}>
              <p style={{paddingRight:'10px'}}>最大值：{max}</p>
              <p style={{paddingRight:'10px'}}>最小值：{min}</p>
              <p style={{paddingRight:'10px'}}>平均值：{avg}</p>
            </span>
          </Trend>
        </ChartCard>
      </Modal>

    )
  }
}
