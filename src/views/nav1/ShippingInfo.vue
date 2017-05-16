<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<!--
        <el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getShippingInfos">查询</el-button>
				</el-form-item>
        -->
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="shippingInfos" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="40">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="info" label="运费信息" sortable>
			</el-table-column>
			<el-table-column prop="store" label="商家名称" width="120" :formatter="formatStore" sortable>
			</el-table-column>
			<el-table-column prop="cat" label="类别" width="120" :formatter="formatCat" sortable>
			</el-table-column>
			<el-table-column prop="state" label="状态" width="80" :formatter="formatState" sortable>
      </el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<!--
				<el-form-item label="商家" prop="store">
					<el-input v-model="editForm.store" auto-complete="off"></el-input>
				</el-form-item>
				-->
				<el-form-item label="商家" prop="store">
					<el-select v-model="editForm.store" placeholder="请选择商家">
						<el-option v-for="item in stores" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>	
				<el-form-item label="状态" prop="state">
					<el-radio-group v-model="editForm.state">
						<el-radio class="radio" :label="1">有效</el-radio>
						<el-radio class="radio" :label="0">无效</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="类别" prop="cat">
					<el-select v-model="editForm.cat" placeholder="请选择类别">
						<el-option v-for="item in cats" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>	
				<el-form-item label="运费信息" prop="info">
					<el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8}" v-model="editForm.info"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<!--
				<el-form-item label="商家" prop="store">
					<el-input v-model="addForm.store" auto-complete="off"></el-input>
				</el-form-item>
				-->
				<el-form-item label="商家" prop="store">
					<el-select v-model="addForm.store" placeholder="请选择类别">
						<el-option v-for="item in stores" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>	
				<el-form-item label="状态" prop="state">
					<el-radio-group v-model="addForm.state">
						<el-radio class="radio" :label="1">有效</el-radio>
						<el-radio class="radio" :label="0">无效</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="类别" prop="cat">
					<el-select v-model="addForm.cat" placeholder="请选择商家">
						<el-option v-for="item in cats" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>	
				<el-form-item label="运费信息" prop="info">
					<el-input type="textarea" v-model="addForm.info"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getShippingInfoListPage, removeShippingInfo, batchRemoveShippingInfo, editShippingInfo, addShippingInfo,
   getStores, getCategories } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				stores: [],
				storeIdNameMap: {},
				cats: [],
				catIdNameMap: {},
				shippingInfos: [],
				total: 0,
				page: 1,
				pageSize: 20,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
				},
				//编辑界面数据
				editForm: {
					store: '',
					state: -1,
					cat: '',
					info: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
				},
				//新增界面数据
				addForm: {
					store: '',
					state: 1,
					cat: '',
					info: ''
				}

			}
		},
		methods: {
			//state显示转换
			formatState: function (row, column) {
				return row.state == 1 ? '有效' : row.state == 0 ? '无效' : '未知';
			},
			formatDate: function (row, column) {
				return (!row.expire || row.expire == '') ? '' : util.formatDate.format(new Date(row.expire), 'yyyy-MM-dd');
			},
			formatStore: function (row, column) {
				return this.storeIdNameMap[row.store] || row.store;
			},
      formatCat: function (row, column) {
				return this.catIdNameMap[row.cat] || row.cat;
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getShippingInfos();
			},
			getStores(){
				return getStores().then((res) => {
					let stores = res.data.data;
					stores.forEach(e => {
						this.storeIdNameMap[e.id] = e.name;
						e.id = parseInt(e.id);
					});
					this.stores = stores;
					//NProgress.done();
				});
			},
      getCats(){
				return getCategories().then((res) => {
					let cats = res.data.data;
					console.log('CAT:', cats);
					cats.forEach(e => {
						this.catIdNameMap[e.id] = e.name;
					});
					this.cats = cats;
					//NProgress.done();
				});
			},
			//获取商家运费信息列表
			getShippingInfos() {
				let para = {
					page: this.page,
					pageSize : this.pageSize,
					name: this.filters.name
				};
				this.listLoading = true;
				//NProgress.start();
				return getShippingInfoListPage(para).then((res) => {
					this.total = res.data.data.total;
					this.shippingInfos = res.data.data.shippings;
					this.listLoading = false;
					//NProgress.done();
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeShippingInfo(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getShippingInfos();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);;
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					store: '',
					state: 1,
					cat: '',
					info: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						//this.$confirm('确认提交吗？', '提示', {}).then(() => {
							let para = Object.assign({}, this.editForm);
							if(!(para.store && para.cat && (para.state === 0 || para.state ===1) && para.info)){
								return this.$message.error('有必要信息未填写');
							}
							this.editLoading = true;
							//NProgress.start();
							//para.expire = (!para.expire || para.expire == '') ? '' : util.formatDate.format(new Date(para.expire), 'yyyy-MM-dd');
							editShippingInfo(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								if(res.data.error){
									this.$message({
										message: '修改失败，可能已添加过此商家此类别运费信息',
										type: 'warning'
									});
									return;
								}
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getShippingInfos();
							});
						//});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						//this.$confirm('确认提交吗？', '提示', {}).then(() => {
							let para = Object.assign({}, this.addForm);
							if(!(para.store && para.cat && (para.state === 0 || para.state ===1) && para.info)){
								return this.$message.error('有必要信息未填写');
							}
							this.addLoading = true;
							//NProgress.start();
							addShippingInfo(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								if(res.data.error){
									this.$message({
										message: '添加失败，可能已添加过此商家此类别运费信息',
										type: 'warning'
									});
									return;
								}
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getShippingInfos();
							});
						//});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveShippingInfo(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getShippingInfos();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			Promise.all([
				this.getCats(),
				this.getStores()
			])
			.then(() => this.getShippingInfos());
		}
	}

</script>

<style scoped>

</style>