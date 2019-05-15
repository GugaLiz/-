import React,{Component,Fragment} from 'react';
import styles from './Left.less';
import {Menu,Icon,Button,Tabs } from 'antd';
import DataList from './DataList';
import DataNetworks from './DataNetworks';
import DataParams from './DataParams';
import Analysis from './Analysis';
import BasicLayout from '../../../../../layouts/BasicLayout';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TabPane = Tabs.TabPane;

export default class LeftPnl extends Component{
  state = {
    collapsed:false,
    tabPosition:'left',
    current: 'mail',
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  handleClick = (e) => {
    console.log('click ', e);
    this.setState({
      current: e.key,
    });
  };



  render(){
    const {datas,fileData,paramSetting} = this.props;
    //let FileData = this.Datas;
    //console.info(datas,fileData)

    const display = this.state.collapsed ? 'none' :'block';

    const h = window.innerHeight - 64;

    const txt = (<span> > </span>);
    return (
      <div style = {{width:250,display:'flex'}}>
        <div style={{width:250,backgroundColor:'white',border:'1px solid #ccc',borderRadius:'2px',display:display}}>
        <Tabs tabPosition={this.state.tabPosition}  style={{height:h,width:'min-content'}}>
          <TabPane tab="Data" key="1" >
            <DataList style={{height:0.3*h}} FileData={fileData} />
            <DataNetworks style={{height:0.7*h}} ParamSetting = {paramSetting} />
          </TabPane>
          <TabPane tab="Parameter" key="2"><DataParams /></TabPane>
          <TabPane tab="Event" key="3">Content of Tab Pane 3</TabPane>
          <TabPane tab="Analysis" key="4"><Analysis /></TabPane>
        </Tabs>
        </div>
        <div>
          <a onClick={this.toggleCollapsed} style={{width:18,backgroundColor:'white',height:40,borderRadius:'0px 2px 2px 0px',boxShadow:'0 0 7px 0 rgba(0,0,0,0.3) !important'}}>
            {this.state.collapsed ?  '>' : '<'}
          </a>
        </div>
      </div>
    )
  }

}
