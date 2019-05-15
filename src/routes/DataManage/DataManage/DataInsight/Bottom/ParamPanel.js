import React,{Component} from 'react';
import {Table,Layout,Tooltip,Icon,Modal} from 'antd';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import { Tab } from '../../../../../components/Login';

const { Sider, Content } = Layout;

export default class ParamPanel extends Component{
  state = {
    cellInfoVisible:true,
    measurementVisible:true,
  }

  okHandle = () => {

  };

  hadleCellInfoVisible = (flag) => {
    this.setState({
      cellInfoVisible:!!flag
    })
  };

  render(){
    const columns = [{
      title:'参数',
      dataIndex:'Name',
    },{
      title:'值',
      dataIndex:'Val'
    }];

    const CellInfo = (
      <ChartCard
        style={{flex:1}}
        width='50%'
        bordered={true}
        title="Serving Cell Info"
        action={
          <Tooltip title="">
            <Icon type="close" onClick={this.close}/>
          </Tooltip>
        }
        footer={
          <Table size="small"
                 columns={columns}
          >
          </Table>
        }
      >

      </ChartCard>
    );
    const RadioMeasurement = (<ChartCard
      style={{flex:1}}
      width='50%'
      bordered={true}
      title="Radio Measurement"
      action={
        <Tooltip title="">
          <Icon type="close" onClick={this.close}/>
        </Tooltip>
      }
      footer={
        <Table size="small"
               columns={columns}
        >
        </Table>
      }

    >

    </ChartCard>);
    return (
      <div style={{display:'flex'}}>
        {CellInfo}
        {RadioMeasurement}
      </div>
    )
  }

}
