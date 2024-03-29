import { isUrl } from '../utils/utils';

const menuData = [
  {
    name:'首页',
    icon:'dashboard',
    path:'index',
  },
  {
    name: 'AirFleet',
    icon: 'select',
    path: 'airfleet',
  },
  {
    name:'数据管理',
    icon:'table',
    path:'dataManage',
    children:[{
      name:'测试数据管理',
      path:'dataManage'
    },{
      name:'基础数据管理',
      path:'mapManage'
    }]
  }
    
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
