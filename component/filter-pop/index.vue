<template>
	<view>
		<uni-popup ref="filterPop" background-color="#fff" @change="change">
			<view :class="['popup-content', theme]">
				<view class="filter-title">日期筛选</view>
				<view class="filter-date">
					<text>开始日期：</text>
					<biaofun-datetime-picker
						end="2100"
						start="2000"
						fields="day"
						class="filter-date-input"
						placeholder="请选择开始时间"
						:defaultValue="startTimeTemp"
						@change="changeStartTimePicker"
					></biaofun-datetime-picker>
				</view>
				<view class="filter-date">
					<text>结束日期：</text>
					<biaofun-datetime-picker
						end="2100"
						start="2000"
						fields="day"
						class="filter-date-input"
						:defaultValue="endTimeTemp"
						placeholder="请选择结束时间"
						@change="changeEndTimePicker"
					></biaofun-datetime-picker>
				</view>
				
				<view class="filter-title">支出</view>
				<view class="filter-types">
					<view
						:key="item.id"
						v-for="item in outputTypeList"
						:class="{'filter-types-item': true, 'types-active': typeActive(item.name)}"
						@click="() => chooseType(item.name)"
					>{{item.name}}</view>
				</view>
				
				<view class="filter-title">收入</view>
				<view class="filter-types">
					<view
						:key="item.id"
						v-for="item in incomeTypeList"
						:class="{'filter-types-item': true, 'types-active': typeActive(item.name)}"
						@click="() => chooseType(item.name)"
					>{{item.name}}</view>
				</view>
				
				<view class="filter-btn-group">
					<button class="filter-btn-reset" @click="resetHandler">重置</button>
					<button type="primary" class="filter-btn-submit" @click="submitHandler">筛选</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import BiaofunDatetimePicker from '@/component/biaofun-datetime-picker/biaofun-datetime-picker.vue'
	export default {
		name: 'FilterPop',
		components: {
			BiaofunDatetimePicker,
		},
		props: {
			endTime: {
				type: String,
				default: dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59'
			},
			typeList: {
				type: Array,
				default: () => []
			},
			startTime: {
				type: String,
				default: dayjs(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)).format('YYYY-MM-DD') + ' 00:00'
			},
		},
		computed: {
			theme () {
				return this.$store.getters.themeLive
			},
			outputTypeList () {
				return this.$store.state.outputTypeList
			},
			incomeTypeList () {
				return this.$store.state.incomeTypeList
			}
		},
		data() {
			return {
				endTimeTemp: this.endTime,
				typeListTemp: this.typeList,
				startTimeTemp: this.startTime,
			}
		},
		created() {
			const that = this
		},
		methods: {
			change (e) {
				this.$emit('change', e)
			},
			isType (val) {
			  let type = Object.prototype.toString.call(val).replace(']', '').split(' ')[1].toLocaleLowerCase()
			  return type
			},
			changeStartTimePicker (val) {
				this.startTimeTemp = `${val.f1} 00:00`
			},
			changeEndTimePicker (val) {
				this.endTimeTemp = `${val.f1} 23:59`
			},
			typeActive (val) {
				return this.typeListTemp.findIndex(v => v == val) !== -1
			},
			chooseType (val) {
				const index = this.typeListTemp.findIndex(v => v == val)
				if (index === -1) {
					this.typeListTemp.push(val)
				} else {
					this.typeListTemp.splice(index, 1)
				}
			},
			resetHandler () {
				this.typeListTemp = []
				this.endTimeTemp = dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59'
				this.startTimeTemp = dayjs(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)).format('YYYY-MM-DD') + ' 00:00'
				const params = {
					typeList: [],
					endTime: this.endTimeTemp,
					startTime: this.startTimeTemp
				}
				this.$emit('initFilter', params)
				this.$refs.filterPop.close()
			},
			submitHandler () {
				const params = {
					endTime: this.endTimeTemp,
					typeList: this.typeListTemp,
					startTime: this.startTimeTemp
				}
				this.$emit('initFilter', params)
				this.$refs.filterPop.close()
			}
		}
	}
</script>

<style lang="scss" scoped>
.popup-content {
	width: 500rpx;
	min-height: 100vh;
	padding: 100rpx 30rpx 30rpx;
	
	.filter-title {
		font-size: 36rpx;
		font-weight: 600;
		margin: 50rpx 0 30rpx;
	}
	
	.filter-date {
		@include flex(flex-start);
		padding: 10rpx 0;
		
		.filter-date-input {
			@include flex(flex-start);
			flex: 1;
			border-bottom: 1rpx solid #ddd;
		}
	}
	
	.filter-types {
		@include flex(flex-start);
		
		.filter-types-item {
			padding: 10rpx 20rpx;
			border: 1px solid #ddd;
			border-radius: 10rpx;
			margin: 0 10rpx 5rpx 0;
			
			&.types-active {
				background: #ddd;
			}
		}
	}
	
	.filter-btn-group {
		@include flex(space-between);
		margin-top: 30rpx;
		
		.filter-btn-reset {
			flex: 1;
			margin-right: 10rpx;
		}
		.filter-btn-submit {
			flex: 1;
		}
	}
}
</style>
