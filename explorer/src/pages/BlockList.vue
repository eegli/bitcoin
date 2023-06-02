<!-- BlockList.vue -->

<template>
    <loading :active='isLoading' :is-full-page="fullPage" :loader='loader' />
    <div class="blocklist">
        <el-row justify="center" class="search">
            <el-input v-model="searchNumber" placeholder="Insert Block Height" @keyup.enter="goToBlock" />
            <el-button class="search-button" type="primary" @click="goToBlock">Search</el-button>
        </el-row>
        <el-row justify="center">
            <el-table :data="displayedBlocks" stripe style="width: 60%">
                <el-table-column prop="height" label="Height" width="180">
                    <template #default="{ row }">
                        <router-link :to="{ name: 'transactions', params: { height: row.height } }">
                            {{ row.height }}
                        </router-link>
                    </template>
                    <template #header="{ column }">
                        <el-popover placement="top-start" content="The height of the block." :width="220">
                            <template #reference>
                                <span>{{column.label}}</span>
                            </template>
                        </el-popover> 
                    </template>
                </el-table-column>
                <el-table-column prop="ntime" label="Time" width="180" >
                    <template #default="{ row }">
                        {{ formatTime(row.ntime) }}
                    </template>
                    <template #header="{ column }">
                        <el-popover placement="top-start" content="Timestamp of the block." :width="220">
                            <template #reference>
                                <span>{{column.label}}</span>
                            </template>
                        </el-popover> 
                    </template>
                </el-table-column>
                <el-table-column prop="hash" label="Hash" width="680" >
                    <template #header="{ column }">
                        <el-popover placement="top-start" content="The hash of the block." :width="220">
                            <template #reference>
                                <span>{{column.label}}</span>
                            </template>
                        </el-popover> 
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row justify="center">
            <div class="pagination-block">
                <el-pagination
                    @current-change="handlePageChange"
                    background
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :total="total"
                    layout="prev, pager, next"
                />
            </div>
        </el-row>
    </div>
</template>

<script>
import api from "../api/index"
import { ElMessage } from 'element-plus'

export default {
    data(){
        return {
            blocks: [] ,// store latest list data
            currentPage: 1, 
            pageSize: 30, 
            total: 0,
            popoverVisible: false,
            searchNumber:'',
            displayedBlocks:[],
            previousOffset: 0,
            previousLimit: 30,
            isLoading: false,
            fullPage: false,
            loader: 'bars'
        };
    },
    mounted(){
        this.fetchBlocks(); // read data from API/test
    },
    methods: {
        // fetchBlocks(){
        //     // const startIndex = (this.currentPage - 1) * this.pageSize;
        //     // const endIndex = this.currentPage * this.pageSize;

        //     // read data from api/json, save it in arraylist blocks

        //     // api.getBlockTest().then(response => {
        //     //     this.blocks = response.data.data.blocks;
        //     // })
        //     // .catch(error => {
        //     //     console.log(error)
        //     // });

        fetchBlocks() {
            this.isLoading = true;

            const offset = this.previousOffset + this.previousLimit;
            const limit = this.pageSize;

            api.getBlock({ offset, limit }).
                then(response => {
                    this.blocks = response.data.data.blocks;
                    this.total = response.data.data.pagination.total;
                    this.previousOffset = offset;
                    this.previousLimit = limit;
                    this.updateDisplayedBlocks();

                    this.isLoading = false;
                })
                .catch(error => {
                    console.log(error);
                    this.isLoading = false;
                });
        },

        updateDisplayedBlocks() {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            this.displayedBlocks = this.blocks.slice(startIndex, endIndex);
        },
        handlePageChange(currentPage) {
            // handle page change
            this.currentPage = currentPage;
            this.updateDisplayedBlocks();
            // this.fetchBlocks();
        },
        goToBlock() {
            const number = parseInt(this.searchNumber);
            if (!isNaN(number)) {
                if (number > this.total) {
                    ElMessage.error('Block does not exit');
                } else {
                    this.$router.push({ name: 'transactions', params: { height: number } });
                }
            } else {
                ElMessage.error('please insert a number');
            }
        },

        formatTime(timestamp){
            // change the timestamp to the real time
            const data = new Date(timestamp * 1000);
            const formattedTime = data.toLocaleString();
            return formattedTime;
        },

        showPopover() {
            this.popoverVisible = true;
            this.updateDisplayedBlocks();
        },
    },
}
</script>

<style scoped>
.search{
    width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    flex-wrap: nowrap;
}
.blocklist {
    width: 100%;
    border: 5px inset #e5e5e5;
    box-sizing:border-box;
    background-color: #c6e2ff;
    padding: 40px;
    margin: 0;
    min-height: 75vh;
}
.pagination-block{
    padding: 30px;
}
</style>