<template>
    <section class="chart-container">
    	<!--工具条-->
		<el-row :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="params">
                <el-form-item label="按日：开始日期">
                    <el-date-picker type="date" placeholder="选择开始日期" format="yyyy-MM-dd" v-model="params.startTime"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getDailyData">查询</el-button>
                </el-form-item>
                <el-form-item label="按周：过去几周">
                  <el-input-number v-model="params.num" :min="1" :max="10"></el-input-number>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getWeekData">查询</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <!--
            <el-col :span="12">
                <div id="chartColumn" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartBar" style="width:100%; height:400px;"></div>
            </el-col>
            -->
            <el-col :span="24">
                <div id="chartLine" style="width:100%; height:400px;"></div>
            </el-col>
            <!--
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="24">
                <a href="http://echarts.baidu.com/examples.html" target="_blank" style="float: right;">more>></a>
            </el-col>
            -->
        </el-row>
    </section>
</template>

<script>
    import echarts from 'echarts'
    import moment from 'moment-timezone'
	import { getPVDaily, getUVDaily, getPVWeekly, getUVWeekly} from '../../api/api'

    export default {
        data() {
            return {
                chartColumn: null,
                chartBar: null,
                chartLine: null,
                model: 'daily',
                params: {
                  startTime: new Date(),
                  num : 1
                },
                chartPie: null
            }
        },

        methods: {
            getDailyData() {
                this.model = 'daily';
                this.drawLineChart();
            },
            getWeekData() {
                this.model = 'week';
                this.drawLineChart();
            },
            drawColumnChart() {
                this.chartColumn = echarts.init(document.getElementById('chartColumn'));
                this.chartColumn.setOption({
                  title: { text: 'Column Chart' },
                  tooltip: {},
                  xAxis: {
                      data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
                  },
                  yAxis: {},
                  series: [{
                      name: '销量',
                      type: 'bar',
                      data: [5, 20, 36, 10, 10, 20]
                    }]
                });
            },
            drawBarChart() {
                this.chartBar = echarts.init(document.getElementById('chartBar'));
                this.chartBar.setOption({
                    title: {
                        text: 'Bar Chart',
                        subtext: '数据来自网络'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['2011年', '2012年']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        boundaryGap: [0, 0.01]
                    },
                    yAxis: {
                        type: 'category',
                        data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)']
                    },
                    series: [
                        {
                            name: '2011年',
                            type: 'bar',
                            data: [18203, 23489, 29034, 104970, 131744, 630230]
                        },
                        {
                            name: '2012年',
                            type: 'bar',
                            data: [19325, 23438, 31000, 121594, 134141, 681807]
                        }
                    ]
                });
            },
            drawLineChart() {
                this.chartLine = echarts.init(document.getElementById('chartLine'));
                let para = Object.assign({}, this.params);          
                let p, min;
                if(this.model == 'daily'){
                    delete para.num;
                    min = new Date(moment(para.startTime).format('YYYY-MM-DD 00:00:00'));
                    para.startTime = moment(para.startTime).format('YYYY-MM-DD');
                    p = Promise.all([
                        getPVDaily(para),
                        getUVDaily(para),
                    ]);
                }else{
                    delete para.startTime;
                    p = Promise.all([
                        getPVWeekly(para),
                        getUVWeekly(para),
                    ]);
                }

                p.then(([pv_re, uv_re]) => {
                  let x = [], pv_y = [], uv_y = [];
                  
                  if(this.model !== 'daily'){
                    let n = getWeekOfYear();
                    let c = parseInt(para.num);
                    for(let i = n-c+1; i <= n; i++){
                        x.push({value:`第${i}周`, v: i});
                    }
                    let m = {} ;
                    pv_re.data.data.forEach(({date, num}) => m[date]=num);
                    pv_y = x.map(e => m[e.v] || 0);
                    m = {};        
                    uv_re.data.data.forEach(({date, num}) => m[date]=num);
                    uv_y = x.map(e => m[e.v] || 0); 
                    //pv_y = pv_re.data.data.map(({date, num}) => num);                   
                    //uv_y = uv_re.data.data.map(({date, num}) => num);                    
                  }else{
                    pv_y = pv_re.data.data.map(({date, num}) => [date, num]);                   
                    uv_y = uv_re.data.data.map(({date, num}) => [date, num]);
                  }

                  this.chartLine.setOption({
                    title: {
                        text: (this.model !== 'daily') ? `本周：第${getWeekOfYear()}周` : ''
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['PV', 'UV']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: (this.model == 'daily') ? {
                        type: 'time',
                        boundaryGap: false,
                        min: min,
                        max: new Date()
                        //data: x//['2017/04/24', '2017/04/25', '2017/04/26','2017/04/27','2017/04/28','2017/04/29','2017/04/30']
                    } : {
                        type: 'category',
                        boundaryGap: false,
                        data: x//['2017/04/24', '2017/04/25', '2017/04/26','2017/04/27','2017/04/28','2017/04/29','2017/04/30']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            name: 'PV',
                            type: 'line',
                            //stack: '总量',
                            areaStyle: {normal: {}},
                            data: pv_y//[120, 132, 101, 134, 90, 230, 210]
                        },
                         {
                             name: 'UV',
                             type: 'line',
                             //stack: '总量',
                             areaStyle: {normal: {}},
                             data: uv_y//[220, 182, 191, 234, 290, 330, 310]
                        },
                        // {
                        //     name: '搜索引擎',
                        //     type: 'line',
                        //     stack: '总量',
                        //     data: [820, 932, 901, 934, 1290, 1330, 1320]
                        // }
                    ]
                  });

                });
            },
            drawPieChart() {
                this.chartPie = echarts.init(document.getElementById('chartPie'));
                this.chartPie.setOption({
                    title: {
                        text: 'Pie Chart',
                        subtext: '纯属虚构',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                    },
                    series: [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: [
                                { value: 335, name: '直接访问' },
                                { value: 310, name: '邮件营销' },
                                { value: 234, name: '联盟广告' },
                                { value: 135, name: '视频广告' },
                                { value: 1548, name: '搜索引擎' }
                            ],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                });
            },
            drawCharts() {
                //this.drawColumnChart()
                //this.drawBarChart()
                this.drawLineChart()
                //this.drawPieChart()
            },
        },

        mounted: function () {
            //this.drawCharts()
        },
        /*updated: function () {
            this.drawCharts()
        }*/
    }

    function getWeekOfYear(){
        var d1 = new Date();
        var d2 = new Date();
        d2.setMonth(0);
        d2.setDate(1);
        var rq = d1-d2;
        var s1 = Math.ceil(rq/(24*60*60*1000));
        var s2 = Math.ceil(s1/7);
        return s2;
    }
</script>

<style scoped>
    .chart-container {
        width: 100%;
        float: left;
    }
    /*.chart div {
        height: 400px;
        float: left;
    }*/

    .el-col {
        padding: 30px 20px;
    }
</style>
