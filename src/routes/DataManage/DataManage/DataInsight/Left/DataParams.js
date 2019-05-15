import React,{Component} from 'react';
import {Menu,Icon,Tree,Input} from 'antd';

const SubMenu = Menu.SubMenu;
const DirectoryTree = Tree.DirectoryTree;
const {TreeNode} = Tree;
const Search = Input.Search;

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level,_preKey,_tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;
  const children = [];
  for(let i = 0;i<x;i++){
    const key = `${preKey}-${i}`;
    tns.push({title:key,key});
    if(i < y){
      children.push(key);
    }
  }
  if(_level < 0){
    return tns;
  }
  const level = _level - 1;
  children.forEach((key,index) => {
    tns[index].children = [];
    return generateData(level,key,tns[index].children);
  });
};
generateData(z);

const dataList = [];
const generateList = (data) => {
  for(let i = 0;i < data.length;i++){
    const node = data[i];
    const key = node.key;
    dataList.push({key,title:key});
    if(node.children){
      generateList(node.children,node.key);
    }
  }
};
generateList(gData);

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => (item.text).indexOf(key) )) {
        parentKey = node.id;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  console.info(parentKey);
  return parentKey;
};

// const getParentKey = (key,tree) => {
//   let parentKey;
//   for(let i = 0;i < tree.length;i++){
//     const node = tree[i];
//
//     if(node.children){
//       let childrens = node.children;
//       childrens.map((item) => {
//         if(item.text.indexOf(key) > -1){
//           parentKey = node.id;
//         }else if(getParentKey(key,node.children)){
//           parentKey = getParentKey(key,node.children);
//         }
//       })
//         }
//
//     }
//   console.info(parentKey);
//   return parentKey;
//
// };

export default class DataParams extends Component {
  //rootSubmenuKeys = ['sub1','Common'];

  state = {
    paramTreeDatas:[],
    commonTreeDatas:[],
    defaultText:'',
    _isDDIB:false,
    rootSubmenuKeys:[],
    openKeys:['sub1'],
    expandedKeys:[],
    searchValue:'',
    autoExpandParent:false,
  };

  componentDidMount = () => {
    let rootMenuKeys = [];
    let url = '';
    let decode = {};
    let decodeId = 2429;
    let net = 7;
    //if(this.state.op)
    if(this.state._isDDIB){
      url = './api/DataInsight/GetDecodeParams?decodeId=0&WF_EvnetID='+decodeId+'&netType='+net;
    }else {
      url = './api/DataInsight/GetDecodeParams?decodeId=' + decodeId + '&netType=' + net;
    }
    fetch(url,{
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
       // console.info(respData);

        rootMenuKeys.push(respData.text);
        rootMenuKeys.push('Common');
        this.setState({
          paramTreeDatas:respData.children,
          defaultText:respData.text,
          openKeys:[respData.id],
          rootSubmenuKeys:rootMenuKeys
        })
      })
      .catch((error) => {
        console.log(error)
      })

    //获取Common
    url = './api/DataInsight/GetDecodeParams?decodeId=' + decodeId + '&netType=-1';
    fetch(url,{
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        this.setState({
          commonTreeDatas:respData.children,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  };

  onOpenChange = (openKeys) =>{

    const latesOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === 1);
    console.info(latesOpenKey);
    if(this.state.rootSubmenuKeys.indexOf(latesOpenKey) === -1){
      console.log(111)
      this.setState({openKeys});
    }else{
      console.log(2222)
      this.setState({
        openKeys:latesOpenKey ? [latesOpenKey] : [],
      });
    }
  };

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent:false,
    });
  };

  onChange = (e) => {
    const value = e.target.value;
    let rootDatas = this.state.commonTreeDatas;
    let dataList = rootDatas[0].children;
    const expandedKeys = dataList.map((item) => {
      // if (item.text.indexOf(value) > -1) {
      //   return getParentKey(item.text, dataList);
      //
      // }
      return getParentKey(value, dataList);
     // return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  // onChange = (e) => {
  //   let dataList = this.state.paramTreeDatas;
  //   const value = e.target.value;
  //   const expandedKeys = dataList.map((item) => {
  //     //console.info(item);
  //     if(item.text.indexOf(value) > -1){
  //       return item.id;
  //       //return getParentKey(item.text,dataList);
  //       //return getParentKey(item.key,gData);
  //     }else{
  //       return getParentKey(value,dataList);
  //     }
  //     return null;
  //   }).filter((item,i,self) => item && self.indexOf(item) === i);
  //   //console.info(expandedKeys);
  //   this.setState({
  //     expandedKeys,
  //     searchValue:value,
  //     autoExpandParent:true,
  //   });
  //
  // };

  onDrop = (info) => {
    console.log(info);
  };



  render(){
    const {searchValue,expandedKeys,autoExpandParent} = this.state;
    const loop = data => data.map((item) => {
      const index = item.text.indexOf(searchValue);
      const beforeStr = item.text.substr(0, index);
      const afterStr = item.text.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.text}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.id} title={title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={title} />;
    });

    // const loop = data => data.map((item) => {
    //   const index = item.text.indexOf(searchValue);
    //   const beforeStr = item.text.substr(0,index);
    //   const afterStr = item.text.substr(index + searchValue.length);
    //   const title = index > -1?(
    //     <span>
    //       {beforeStr}
    //       <span style={{color:'#f50'}}>{searchValue}</span>
    //       {afterStr}
    //     </span>
    //   ) : <span>{item.text}</span>;
    //   if(item.children){
    //     return(
    //       <TreeNode key={item.id} title={title}>
    //         {loop(item.children)}
    //       </TreeNode>
    //     );
    //   }
    //   return <TreeNode key={item.id} title={title} />;
    // });


    return (
      <Menu
        mode = "inline"
        openKeys={this.state.openKeys}
        onOpenChange={this.onOpenChange}
        style={{width:250}}
      >
        {/*<SubMenu*/}
          {/*key={this.state.openKeys} title={<span>{this.state.defaultText}</span>}*/}
        {/*>*/}
          {/*<div>*/}
          {/*<Search style={{marginBottom:8}} placeholder="search" onChange={this.onChange} />*/}
            {/*<Tree*/}
              {/*onExpand={this.onExpand}*/}
              {/*expandedKeys={expandedKeys}*/}
              {/*autoExpandParent={autoExpandParent}*/}
              {/*draggable={true}*/}
              {/*onDrop={this.onDrop}*/}
            {/*>*/}
              {/*{loop(this.state.paramTreeDatas)}*/}
            {/*</Tree>*/}

          {/*</div>*/}
        {/*</SubMenu>*/}
        <SubMenu
          key={this.state.openKeys} title={<span>Common</span>}
        >
          <div>
            <Search style={{marginBottom:8}} placeholder="search" onChange={this.onChange} />
            <Tree
              onExpand={this.onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              draggable={true}
              onDrop={this.onDrop}
            >
              {loop(this.state.commonTreeDatas)}
            </Tree>
          </div>
        </SubMenu>
      </Menu>
    )
  }

}
