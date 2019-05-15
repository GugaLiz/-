import React,{Component} from 'react';
import {Modal,Table,Select} from 'antd';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import moment from 'moment';

const Option = Select.Option;

export default class MessageList extends Component{

  okHandle = () => {

  };

  handleChange = (value) => {
    console.log(value);
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
    console.log(modalVisible);
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
      title:'Message',
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
             title="信令列表"
             visible = {modalVisible}
             footer={null}
             mask={false}
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
            信令过滤:
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder=""
              optionFilterProp="children"
              onChange={this.handleChange}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="tom">Tom</Option>
            </Select>
          </Trend>
        </ChartCard>

      </Modal>
    )
  }

}
