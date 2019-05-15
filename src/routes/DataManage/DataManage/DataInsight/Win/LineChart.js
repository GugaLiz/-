import React,{Component} from 'react';
import { connect } from 'dva';
import {Modal, Tabs,DatePicker } from 'antd';
import NumberInfo from 'components/NumberInfo';
import { TimelineChart,ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import moment from 'moment';

const RangePicker = DatePicker.RangePicker;

const { TabPane } = Tabs;
//
// @connect(({ chart, loading }) => ({
//   chart,
//   loading: loading.effects['chart/fetch'],
// }))

export default class LineChart extends Component{
  state = {
    currentTabKey:'',
  };

  // componentDidMount() {
  //   this.props.dispatch({
  //     type: 'chart/fetch',
  //   });
  // };
  //
  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'chart/clear',
  //   });
  // };

  okHandle = () => {

  };

  onChange = (dates, dateStrings) => {

  };

  render(){
    const {currentTabKey} = this.state;
    const {title,modalVisible} = this.props;

    const offlineData = [];
    for (let i = 0; i < 10; i += 1) {
      offlineData.push({
        name: `门店${i}`,
        cvr: Math.ceil(Math.random() * 9) / 10,
      });
    }
    const offlineChartData = [];
    for (let i = 0; i < 20; i += 1) {
      offlineChartData.push({
        x: new Date().getTime() + 1000 * 60 * 30 * i,
        y1: Math.floor(Math.random() * 100) + 10,
        y2: Math.floor(Math.random() * 100) + 10,
      });
    }


    return (
      <Modal width="70%"
             title="线图"
             footer={null}
             mask={false}
             visible = {modalVisible}
             onOk = {this.okHandle}
             onCancel = {
               () => this.props.handleLineChartVisible()
             }
      >
        <ChartCard style={{ padding: '0px' }}
                   bordered={false}
                   footer={
                     <TimelineChart
                       height={400}
                       data={offlineChartData}
                       titleMap={{ y1: '客流量', y2: '支付笔数' }}
                     />
                   }
                   contentHeight={16}
        >
          <Trend>
            <RangePicker
              ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment().endOf('month')] }}
              showTime
              format="YYYY/MM/DD HH:mm:ss"
              onChange={this.onChange}
            />
          </Trend>
        </ChartCard>



      </Modal>
    )
  }

}
