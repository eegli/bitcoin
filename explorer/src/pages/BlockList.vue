<!-- BlockList.vue -->

<template>
  <loading :active="isLoading" :is-full-page="true" :loader="loader" />
  <div class="blocklist">
    <el-row justify="center" class="search">
      <el-input
        v-model="searchInput"
        placeholder="Insert Block Height or an Address"
        @keyup.enter="goToBlock"
      />
      <el-button class="search-button" type="primary" @click="goToBlock">
        Search
      </el-button>
    </el-row>
    <el-row justify="center">
      <el-table :data="blocks" stripe style="width: 50%">
        <el-table-column prop="height" label="Height" width="180">
          <template #default="{ row }">
            <router-link
              :to="{ name: 'transactions', params: { height: row.height } }"
            >
              {{ row.height }}
            </router-link>
          </template>
          <template #header="{ column }">
            <el-popover
              placement="top-start"
              content="The height of the block."
              :width="220"
            >
              <template #reference>
                <span>{{ column.label }}</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="ntime" label="Time" width="280">
          <template #default="{ row }">
            {{ formatTime(row.ntime) }}
          </template>
          <template #header="{ column }">
            <el-popover
              placement="top-start"
              content="Timestamp of the block."
              :width="220"
            >
              <template #reference>
                <span>{{ column.label }}</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="hash" label="Hash" width="680">
          <template #header="{ column }">
            <el-popover
              placement="top-start"
              content="The hash of the block."
              :width="220"
            >
              <template #reference>
                <span>{{ column.label }}</span>
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
import api from "../api/index";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      blocks: [], // store latest list data
      currentPage: 1,
      pageSize: 30,
      total: 0,
      popoverVisible: false,
      searchInput: "",
      isLoading: false,
      fullPage: false,
      loader: "bars",
    };
  },
  mounted() {
    this.fetchBlocks(); // read data from API/test
  },
  methods: {
    fetchBlocks() {
      this.isLoading = true;
      const offset = (this.currentPage - 1) * this.pageSize;
      const limit = this.pageSize;

      api
        .getBlock(offset, limit)
        .then((response) => {
          this.blocks = response.data.data.blocks;
          this.total = response.data.data.pagination.total;

          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
          this.isLoading = false;
        });
    },
    handlePageChange(currentPage) {
      this.currentPage = currentPage;
      this.fetchBlocks();
    },
    goToBlock() {
      const input = this.searchInput.trim();
      if (input !== "") {
        if (/^\d+$/.test(input)) {
          const number = parseInt(input);
          if (number > this.total) {
            ElMessage.error("Block does not exist");
          } else {
            this.$router.push({
              name: "transactions",
              params: { height: number },
            });
          }
        } else if (/^[a-zA-Z0-9]+$/.test(input)) {
          this.$router.push({
            name: "address",
            params: { address: input },
          });
        } else {
          ElMessage.error("Please insert a valid Block Height or Address");
        }
      } else {
        ElMessage.error("Please insert a Block Height or Address");
      }
    },

    formatTime(timestamp) {
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
};
</script>

<style scoped>
.search {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: nowrap;
}
.blocklist {
  width: 100%;
  border: 5px inset #e5e5e5;
  box-sizing: border-box;
  background-color: #c6e2ff;
  padding: 40px;
  margin: 0;
  min-height: 75vh;
}
.pagination-block {
  padding: 30px;
}
</style>
