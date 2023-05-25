<!-- <template>
    <div>
        <div v-if="tooltip" :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }" class="tooltip">{{ tooltip }}</div>
        <table>
            <thead>
                <h2>Blocks</h2>
                <tr>
                    <th @mouseover="showTooltip('The height of the block' , $event)" @mouseleave="hideTooltip">Height</th>
                    <th @mouseover="showTooltip('The hash of the block' , $event)" @mouseleave="hideTooltip">Hash</th>
                    <th @mouseover="showTooltip('The timestamp of the block' , $event)" @mouseleave="hideTooltip">Time</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(block,index) of displayedBlocks" :key="block.id" :class="index % 2 === 0 ? 'even' : 'odd'">
                    <td>{{ block.height }}</td>
                    <td>{{ block.hash }}</td>
                    <td>{{ formatTime(block.nTime) }}</td>
                </tr>
            </tbody>
        </table>
        <div class="pagination">
            <el-button type="primary" round @click="previousPage">&lt;</el-button>
            <el-button type="primary" round @click="goToPage(page)" v-for="page in displayedPages" :key="page" :class="{ active: page === currentPage }">{{ page }}</el-button>
            <span v-if="showEllipsisStart">...</span>
            <el-button type="primary" round @click="goToPage(totalPages)" v-if="showEllipsisEnd">{{ totalPages }}</el-button>
            <el-button type="primary" round @click="nextPage">&gt;</el-button>
        </div>
    </div>

</template>

<script>
import api from "../api/index"

export default {
    data(){
        return {
            blocks: [] ,// store latest list data
            tooltip: "" ,
            tooltipPosition: {
                top: 0,
                left: 0
            },
            currentPage: 1,
            pageSize: 1,
        }
    },
    mounted(){
        this.fetchBlocks(); // read data from API/test
    },
    methods: {
        fetchBlocks(){
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
        showTooltip(tooltip, event){
            this.tooltip = tooltip;
            const targetRect = event.target.getBoundingClientRect();
            this.tooltipPosition = {
                top: targetRect.top - 10,
                left: targetRect.left + targetRect.width / 2
            };
        },
        hideTooltip(){
            this.tooltip = "";
        },
        goToPage(page) {
            this.currentPage = page;
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
    },
    computed: {
        displayedBlocks() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.blocks.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.blocks.length / this.pageSize);
        },
        displayedPages() {
            const totalVisiblePages = 5; // 显示的总页数，包括省略号
            let start, end;

            if (this.totalPages <= totalVisiblePages) {
                start = 1;
                end = this.totalPages;
            } else if (this.currentPage <= 3) {
                start = 1;
                end = totalVisiblePages - 1;
            } else if (this.currentPage >= this.totalPages - 2) {
                start = this.totalPages - (totalVisiblePages - 2);
                end = this.totalPages;
            } else {
                start = this.currentPage - 2;
                end = this.currentPage + 2;
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        },
        showEllipsisStart() {
            return this.currentPage > 3 && this.totalPages > 5;
        },
        showEllipsisEnd() {
            return this.currentPage < this.totalPages - 2 && this.totalPages > 5;
        }
    }   
}


</script>

<style scoped>
table {
  width: 60%;
  margin: auto;
  /* background-color: #f1f1f1; */
}
h2{
    padding-left: 10px;
    background-color: beige;
}
th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
}
thead th {
  font-weight: bold;
}
tr:last-child td{
    border-bottom: none;
}
.odd{
    background-color: rgb(239, 253, 209);
}
.even{
    background-color: rgb(232, 255, 201);
}
.tooltip {
    position: absolute;
    background-color: #ec540d;
    padding: 2px 5px;
    border: 1px solid #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
    z-index: 1;
    display: inline-block;
    color: #fff;
    font-weight: bold;
    font-size: small;
}
.pagination {
  text-align: center;
  margin-top: 20px;
}

.pagination button {
    margin: 5px;
    color: black;
}

.pagination button.active {
    color: rgb(240, 15, 15);
}
</style> -->

<template>
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
            <el-table-column prop="nTime" label="Time" width="180" >
                <template #default="{ row }">
                    {{ formatTime(row.nTime) }}
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
</template>

<script>
import api from "../api/index"

export default {
    data(){
        return {
            blocks: [] ,// store latest list data
            currentPage: 1, 
            pageSize: 1, 
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