import React,{Component} from 'react';
import {Modal,Select} from 'antd';
import { ChartCard, Field } from 'components/Charts';

const Option = Select.Option;

export default class KPIWave extends Component{


  handleChange = () => {

  };
  
  render(){
    const {modalVisible} = this.props;

    const cloumns = [{
      title:"端口",
      dataIndex:'Port',
    }]

    return (
      <Modal width="70%"
             title="指标波动分析"
             visible = {modalVisible}
             //onOk = {okHandle}
             // onCancel = {
             //   () => this.props.handleFileGridVisible()
             // }
    >
        <ChartCard
          //style={style}
          bordered={true}
          title="参数设置"

          footer={
            <div>
              <Select defaultValue="lucy" style={{ width: 120 }} onChange={handleChange}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </div>
          }
        />
        <ChartCard
          //style={style}
          bordered={true}
          title="当前文件"

          footer={
            <p>2222</p>
          }
        />

        <div>
          <div>
            <ChartCard
              //style={style}
              bordered={true}
              title="项目"

              footer={
                <p>111</p>
              }
            />
            <ChartCard
              //style={style}
              bordered={true}
              title="区域"

              footer={
                <p>2222</p>
              }
            />
          </div>
          <div>

          </div>
        </div>
    </Modal>
    )
  }

}
