import React,{Component} from 'react';
import {Modal,Table,Select} from 'antd';

import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import moment from 'moment';

const Option = Select.Option;
export default class ParamList extends Component{
  state = {
    checkedVal:false
  };

  okHandle = () => {

  };

  handleChange = (value) => {
    console.log(value);
  };

  changeTrueVal = (flag) => {
    let me = this;
    me.setState({
      checkedVal:!!flag
    });

    //todo:fetch list
  };

  toFTime = (tt) => {
    let dt = null;
    if (tt && tt.indexOf && tt.indexOf('T')) {
      dt = Ext.Date.parse(tt, 'Y-m-d\\TH:i:s');
    } else {
      let v = parseInt(tt);
      if (isNaN(v)) {
        v = parseInt(tt.replace(/[^\d-]/g, ""));
      }
      dt = new Date(v);
    }
    return dt;
  };

  render(){
    const {title,modalVisible} = this.props;

    const columns = [{
      title:'No.',
      dataIndex:'Idx',
      render:(v) => {
        return v+1;
      }
    },{
      title:'PC Time',
      dataIndex:'Time',
      render:(val) => {
        let me = this;
        let dt = me.toFTime(val/1000);
        let dtStr = val.toString();
        let ms = dtStr.substr(dtStr.length - 6,3);
        let time2 = moment(dt).format('HH:mm:ss');
        let time2Str = time2 + "."+ ms;
        return time2Str;
      }
    },{
      title:'经度/纬度',
      dataIndex:'GPS',
      render:(val) => {
        if(val){
          return val[1].toFixed(8) + '/' + val[0].toFixed(8);
        }
      }
    },{
      title:'Event',
      dataIndex:'Name'
    }];

    const paginationProps = {
      //onChange: this.changePage,
      pageSize: 15,
      //total: total,
      size: 'small',
      showQuickJumper: true,
      defaultCurrent:1,
      // showTotal: (total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`,
    };

    return (
      <Modal width="70%"
             title="事件列表"
             footer={null}
             mask={false}
             visible = {modalVisible}
             onOk = {this.okHandle}
             onCancel = {
               () => this.props.handleMessageVisible()
             }
      >
        <ChartCard style={{ padding: '0px' }}
                   bordered={false}
                   footer={
                     <Table size="small"
                       //scroll={{ y: h - 350 }}
                       //rowSelection={rowSelection}
                            columns={columns}
                       //dataSource={data}
                            pagination={paginationProps}
                     />
                   }
                   contentHeight={16}
        >
          <Trend>
            <Checkbox onChange={this.changeTrueVal} checked={this.state.checkedVal}>只显示在线</Checkbox>
          </Trend>
        </ChartCard>

      </Modal>
    )
  }

}
