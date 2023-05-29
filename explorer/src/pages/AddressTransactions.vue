<template>
    <div class="address">
        <h3>Balance: {{ balance }}</h3>
        <h3>Transactions:</h3>
        <div v-if="transactions.length === 0">No transactions found.</div>
        <div v-else>
            <el-row>
                <el-col :span="6">
                <el-select v-model="roles" placeholder="Select Role">
                    <el-option label="All" value=""></el-option>
                    <el-option label="Sender" value= sender></el-option>
                    <el-option label="Receiver" value= receiver></el-option>
                </el-select>
                </el-col>
                <!-- <el-col :span="6">
                <el-select v-model="coinbase" placeholder="Select Coinbase">
                    <el-option label="All" value=""></el-option>
                    <el-option label="Coinbase" value="true"></el-option>
                    <el-option label="No Coinbase" value="false"></el-option>
                </el-select>
                </el-col> -->
                <el-col :span="4">
                    <el-button type="primary" @click="fetchAddress">Search</el-button>
                </el-col>
            </el-row>

            <div v-for="transaction in displayedTransactions" :key="transaction.txid" :class="getTransactionClass(transaction.role)" class="transaction-item">
                <el-tag effect="dark" class="coinbase" v-if="transaction.is_coinbase">Coinbase</el-tag>
                <div>Transaction ID: {{ transaction.txid }}</div>
                <div>Amount: {{ transaction.amount }}</div>
                <div>Role: {{ transaction.role }}</div>
                <router-link :to="{ name: 'transactions', params: { height: transaction.height } }">
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
                        :page-size="previousLimit"
                        :total="total"
                        layout="prev, pager, next"
                    />
                </div>
            </el-row>
        </div>
    </div>
</template>
<script>
import api from '../api/index';

export default {
    data() {
        return {
            address: '',
            balance: 0,
            transactions: [],
            displayedTransactions: [],
            currentPage: 1,
            total: 0,
            previousOffset: 0,
            previousLimit: 30,
            roles: '',
        };
    },
    mounted() {
        this.fetchAddress();
    },
    methods: {
        fetchAddress() {
            const address = this.$route.params.address;
            const offset = this.previousOffset;
            const limit = this.previousLimit;
            const role = this.roles;

            api.getAddress(address, {limit, offset, role})
                .then(response => {
                    this.balance = response.data.data.balance;
                    this.transactions = response.data.data.transactions;
                    this.total = response.data.data.pagination.total;
                    this.previousOffset = offset + this.previousLimit;
                    this.previousLimit = limit;

                    this.updateDisplayedTransactions();
                })
                .catch(error => {
                    console.log(error);
                });
        },

        updateDisplayedTransactions() {
            const startIndex = (this.currentPage - 1) * this.previousLimit;
            const endIndex = startIndex + this.previousLimit;
            this.displayedTransactions = this.transactions
            .slice(startIndex, endIndex)
            
        },
        handlePageChange(currentPage) {
            this.currentPage = currentPage;
            this.updateDisplayedTransactions();
        },
        getTransactionClass(role) {
            return role === 'receiver' ? 'transaction-receiver' : 'transaction-sender';
        },
        formatTime(timestamp) {
            const data = new Date(timestamp * 1000);
            const formattedTime = data.toLocaleString();
            return formattedTime;
        }
    }
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