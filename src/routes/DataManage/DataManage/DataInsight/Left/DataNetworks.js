import React,{Component} from 'react';
import FileGridWin from '../Win/FileGridWin';
import { Layout, Tooltip, Icon, Tree, Button, Table, Radio, Divider, Badge } from 'antd';
import { ChartCard, Field } from 'components/Charts';

import MessageList from '../Win/MessageList';
import EventList from '../Win/EventList';
import LineChart from '../Win/LineChart';
import CellList from '../Win/CellList';

const {TreeNode} = Tree;
export default class DataNetworks extends Component{
  state = {
    messageVisible:false,
    eventVisible:false,
    lineChartVisible:false,
    cellListVisible:false
  };

  add = () => {

  };

  set = () => {

  };

  onSelect = (key,info) => {
    let me = this;
    console.info(key,key[0]);
    if(key[0] == "message"){
      me.setMessageVisible(true);
    }else if(key[0] == "event"){
      me.setEventVisible(true);
    }else if(key[0] == "linechart"){
      me.setLineChartVisible(true);
    }else if(key[0] == "celllist"){
      me.setCellListVisible(true);
    }

  };

  setMessageVisible = (flag) => {
    this.setState({
      messageVisible:!!flag
    })
  };

  setEventVisible = (flag) => {
    this.setState({
      eventVisible:!!flag
    })
  };

  setLineChartVisible = (flag) => {
    this.setState({
      lineChartVisible:!!flag
    })
  };

  setCellListVisible = (flag) => {
    this.setState({
      cellListVisible:!!flag
    });
  };

  render(){
    const h = window.innerHeight;
    const height = 0.2 * h;

    const style = {
      //display: display,
      width: '100%',
      //height: height,
      paddingLeft: '0px',
    };

    const parentMethods = {
      handleMessageVisible:this.setMessageVisible,
      handleEventVisible:this.setEventVisible,
      handleLineChartVisible:this.setLineChartVisible,
      hadleCellListVisible:this.setCellListVisible,
    };

    return (
      <div style={style}>
        <ChartCard
          style={style}
          bordered={true}
          title="网络"
          action={
            <Tooltip title="">
              <Icon type="setting" onClick={this.add}/>
              <Icon type="setting" onClick={this.set}/>
            </Tooltip>
          }
          footer={
            <Tree
              showLine
              defaultExpandedKeys={['LTE']}
              onSelect={this.onSelect}
            >
              <TreeNode title="LTE" key="LTE">
                <TreeNode title="信令" key="message">

                </TreeNode>
                <TreeNode title="事件" key="event">

                </TreeNode>
                <TreeNode title="线图" key="linechart">

                </TreeNode>
                <TreeNode title="Table表" key="table">

                </TreeNode>
                <TreeNode title="Serving Cell Info" key="cellinfo">

                </TreeNode>
                <TreeNode title="Radio Measurement" key="measurement">

                </TreeNode>
                <TreeNode title="Cell List" key="celllist">

                </TreeNode>
              </TreeNode>
            </Tree>
          }

        />
        <MessageList {...parentMethods} modalVisible={this.state.messageVisible} />
        <EventList {...parentMethods} modalVisible={this.state.eventVisible} />
        <LineChart {...parentMethods} modalVisible={this.state.lineChartVisible} />
        <CellList {...parentMethods} modalVisible={this.state.cellListVisible} />

      </div>
    )
  }

}
