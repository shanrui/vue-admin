<template>
	<section>
		<!--工具条-->
		<el-row :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="params">
                <el-form-item label="开始日期">
                    <el-date-picker type="date" placeholder="选择开始日期" v-model="params.startTime"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getData">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>

		<!--列表-->
		<template>
			<el-table :data="urlData" highlight-current-row v-loading="loading" style="width: 100%;">
				<el-table-column type="index" width="60">
				</el-table-column>
				<el-table-column prop="url" label="url" width="500" sortable>
				</el-table-column>
				<el-table-column prop="pv" label="pv" width="100" sortable>
				</el-table-column>
				<el-table-column prop="uv" label="uv" width="100" sortable>
				</el-table-column>                
				<el-table-column prop="date" label="日期" width="150" sortable>
                </el-table-column>
			</el-table>
		</template>

	</section>
</template>
<script>
	import { getURLPV } from '../../api/api';
	import moment from 'moment-timezone'
	//import NProgress from 'nprogress'
	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				loading: false,
				urlData: [
				],
                params:{
                    startTime: new Date()
                }        
			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			//获取用户列表
			getData: function () {
                let para = Object.assign({}, this.params);
				para.startTime = moment(para.startTime).format('YYYY-MM-DD');
				this.loading = true;
				//NProgress.start();
				getURLPV(para).then((res) => {
					this.urlData = res.data.data;
					this.loading = false;
					//NProgress.done();
				});
			}
		},
		mounted() {
			this.getData();
		}
	};

</script>

<style scoped>

</style>