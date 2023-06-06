<template>
  <div class="address">
    <loading :active="isLoading" :is-full-page="true" :loader="loader" />
    <h3>Balance: {{ balance }}</h3>
    <h3>Transactions:</h3>
    <el-row>
      <el-col :span="6">
        <el-select v-model="roles" placeholder="Select Role">
          <el-option label="All" value=""></el-option>
          <el-option label="Sender" value="sender"></el-option>
          <el-option label="Receiver" value="receiver"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="no_coinbases" placeholder="Select Coinbase">
          <el-option label="All" value=""></el-option>
          <el-option label="Coinbase" value="true"></el-option>
          <el-option label="No Coinbase" value="false"></el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="fetchAddress">Search</el-button>
      </el-col>
    </el-row>
    <div v-if="transactions.length === 0">No transactions found.</div>
    <div v-else>
      <div
        v-for="transaction in transactions"
        :key="transaction.txid"
        :class="getTransactionClass(transaction.role)"
        class="transaction-item"
      >
        <el-tag effect="dark" class="coinbase" v-if="transaction.is_coinbase"
          >Coinbase</el-tag
        >
        <div>Transaction ID: {{ transaction.txid }}</div>
        <div>Amount: {{ transaction.amount }}</div>
        <div>Role: {{ transaction.role }}</div>
        <router-link
          :to="{ name: 'transactions', params: { height: transaction.height } }"
        >
          <div>Height: {{ transaction.height }}</div>
        </router-link>
        <div>Time: {{ formatTime(transaction.ntime) }}</div>
      </div>
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
  </div>
</template>
<script>
import api from "../api/index";

export default {
  data() {
    return {
      address: "",
      balance: 0,
      transactions: [],
      currentPage: 1,
      pageSize: 30,
      total: 0,
      roles: "",
      no_coinbases: "",
      isLoading: false,
      fullPage: false,
      loader: "bars",
    };
  },
  mounted() {
    this.fetchAddress();
  },
  methods: {
    fetchAddress() {
      this.isLoading = true;
      const address = this.$route.params.address;
      const offset = (this.currentPage - 1) * this.pageSize;
      const limit = this.pageSize;
      const role = this.roles;
      const no_coinbase = this.no_coinbases

      api
        .getAddress(address, offset, limit, role, no_coinbase)
        .then((response) => {
          this.balance = response.data.data.balance;
          this.transactions = response.data.data.transactions;
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
      this.fetchAddress();
    },
    getTransactionClass(role) {
      return role === "receiver"
        ? "transaction-receiver"
        : "transaction-sender";
    },
    formatTime(timestamp) {
      const data = new Date(timestamp * 1000);
      const formattedTime = data.toLocaleString();
      return formattedTime;
    },
  },
};
</script>

<style scoped>
.address {
  margin: 20px;
  background-color: #e8e8e8;
  padding: 20px;
}

.transaction-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  line-height: 1.5;
}

.transaction-receiver {
  background-color: #f2f2f2;
}

.transaction-sender {
  background-color: #d9d9d9;
}
</style>
