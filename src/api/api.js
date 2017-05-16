import axios from 'axios';

let base, base_;
console.log('__DEV__', __DEV__);
if( __DEV__ ){
  base_ = 'http://api2.geewoo.com';
}else{
  base_ = 'http://api.geewoo.com';
}

base = base_ + '/manager';

export const requestLogin = ({username, password}) => {
  return axios.post(`${base}/login`, {name: username, pwd: password})
  .then(res => {
    if(res.data.data && res.data.data.token){
      axios.defaults.headers.common['token'] = res.data.data.token;
    }
    return res.data;
  });
};

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };


// store discouts
export const getDiscountList = params => {
  return axios.get(`${base}/discounts`, { params: params }); 
};

export const getDiscountListPage = params => {
  let p = params.page || 1;
  let s = params.pageSize || 20;
  return axios.get(`${base}/discounts/page/${p}/size/${s}`);
};

export const removeDiscount = params => {
  let id = params.id;
  return axios.delete(`${base}/discounts/${id}`);
};

export const batchRemoveDiscount = params => {
  let ids = params.ids;
  return axios.delete(`${base}/discounts?ids=${ids}`);
};

export const editDiscount = params => {
  let id = params.id;
  return axios.put(`${base}/discounts/${id}`, params);
};

export const addDiscount = params => {
  return axios.post(`${base}/discounts`, params);
};


export const getStores = params => {
  return axios.get(`${base_}/site/stores`);
}

export const getCategories = params => {
  return axios.get(`${base_}/site/categories`);
}

// page log

export const getPVDaily = params => {
  return axios.get(`${base}/pagelog/pv/daily`, {params});
}

export const getUVDaily = params => {
  return axios.get(`${base}/pagelog/uv/daily`, {params});
}

export const getPVWeekly = params => {
  return axios.get(`${base}/pagelog/pv/weekly`, {params});
}

export const getUVWeekly = params => {
  return axios.get(`${base}/pagelog/uv/weekly`, {params});
}

export const getURLPV = params => {
  return axios.get(`${base}/pagelog/url/pv/daily`, {params});
}

// store ship info
export const getShippingInfoList = params => {
  return axios.get(`${base}/shipping-info`, { params: params }); 
};

export const getShippingInfoListPage = params => {
  let p = params.page || 1;
  let s = params.pageSize || 20;
  return axios.get(`${base}/shipping-info/page/${p}/size/${s}`);
};

export const removeShippingInfo = params => {
  let id = params.id;
  return axios.delete(`${base}/shipping-info/stores/${id}`);
};

export const batchRemoveShippingInfo = params => {
  let ids = params.ids;
  return axios.delete(`${base}/shipping-info/stores?ids=${ids}`);
};

export const editShippingInfo = params => {
  let id = params.id;
  return axios.put(`${base}/shipping-info/stores/${id}`, params);
};

export const addShippingInfo = params => {
  return axios.post(`${base}/shipping-info/stores`, params);
};

