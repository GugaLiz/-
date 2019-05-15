import React,{Component} from 'react';
import {Modal,Table,Select,Tabs} from 'antd';

import { ChartCard, Field} from 'components/Charts';
import Trend from 'components/Trend';
import moment from 'moment';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
export default class CellList extends Component{

  okHandle = () => {

  };

  changeKey = () => {

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
             title="Cell List"
             visible = {modalVisible}
             onOk = {this.okHandle}
             onCancel = {
               () => this.props.hadleCellListVisible()
             }
      >
        <Tabs type="card" onChange={this.changeKey}>
          <TabPane tab="LTE" key="1">
            <Table size="small"
                   columns={columns}
            />
          </TabPane>

        </Tabs>


      </Modal>
    )
  }

}
