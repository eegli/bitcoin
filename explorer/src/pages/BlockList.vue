<!-- BlockList.vue -->

<template>
    <div class="blocklist">   
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
                <el-table-column prop="hash" label="Hash" width="680" >
                    <template #header="{ column }">
                        <el-popover placement="top-start" content="The hash of the block." :width="220">
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
            </el-table>
        </el-row>
        <el-row justify="center">
            <div class="pagination-block">
                <el-pagination
                    @current-change="handlePageChange"
                    background
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :total="blocks.length"
                    layout="prev, pager, next"
                />
            </div>
        </el-row>
    </div>
</template>

<script>
import api from "../api/index"

export default {
    data(){
        return {
            blocks: [] ,// store latest list data
            currentPage: 1, 
            pageSize: 10, 
            popoverVisible: false,
        };
    },
    mounted(){
        this.fetchBlocks(); // read data from API/test
    },
    methods: {
        fetchBlocks(){
            // const startIndex = (this.currentPage - 1) * this.pageSize;
            // const endIndex = this.currentPage * this.pageSize;

            // read data from api/json, save it in arraylist blocks
            // axios.get('/api/blocks').then(response => {
            api.getBlockTest().then(response => {
                this.blocks = response.data.data.blocks;
            })
            .catch(error => {
                console.log(error)
            });
        },
        formatTime(timestamp){
            // change the timestamp to the real time
            const data = new Date(timestamp * 1000);
            const formattedTime = data.toLocaleString();
            return formattedTime;
        },
        handlePageChange(currentPage) {
            // handle page change
            this.currentPage = currentPage;
            this.fetchBlocks();
        },
        showPopover() {
            this.popoverVisible = true;
        },
    },
    computed: {
        displayedBlocks() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.blocks.slice(startIndex, endIndex);
        }, 
    }

}
</script>

<style>
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