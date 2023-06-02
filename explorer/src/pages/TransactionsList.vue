<!-- TransactionsList.vue -->

<template>
  <loading :active="isLoading" :is-full-page="fullPage" :loader="loader" />
  <div class="title">Coinbase Transaction</div>
  <div class="transactionList">
    <div v-if="block">
      <div class="Id">Transaction ID: {{ block.coinbase.txid }}</div>
      <div class="transaction">
        <div class="transaction-inputs">
          <h4>Inputs:</h4>
          <div
            v-for="input of block.coinbase.inputs"
            :key="input.idx"
            class="transaction-item"
          >
            <el-row>
              <el-col :span="9"
                ><span class="propname">Input Index:</span>
                {{ input.idx }}</el-col
              >
              <el-col :span="15"
                ><span class="propname">Amount:</span>
                {{ input.amount }}</el-col
              >
            </el-row>
            <el-row>
              <router-link
                :to="`/address/${input.address}`"
                class="address-link"
              >
                <el-col :span="24"
                  ><span class="propname">From Address:</span>
                  {{ input.address }}</el-col
                >
              </router-link>
            </el-row>
          </div>
        </div>
        <div class="transaction-outputs">
          <h4>Outputs:</h4>
          <div
            v-for="output of block.coinbase.outputs"
            :key="output.idx"
            class="transaction-item"
          >
            <el-row>
              <el-col :span="9"
                ><span class="propname">Output Index:</span>
                {{ output.idx }}</el-col
              >
              <el-col :span="15"
                ><span class="propname">Output Amount:</span>
                {{ output.amount }}</el-col
              >
            </el-row>
            <el-row>
              <router-link
                :to="`/address/${output.to_addr}`"
                class="address-link"
              >
                <el-col :span="24"
                  ><span class="propname">To Address:</span>
                  {{ output.to_addr }}</el-col
                >
              </router-link>
            </el-row>
          </div>
        </div>
      </div>
      <div class="title">Other Transaction</div>
      <div v-for="transaction of block.transactions" :key="transaction.txid">
        <div class="Id">Transaction ID: {{ transaction.txid }}</div>
        <div class="transaction">
          <div class="transaction-inputs">
            <h4>Inputs:</h4>
            <div
              v-for="input of transaction.inputs"
              :key="input.idx"
              class="transaction-item"
            >
              <el-row>
                <el-col :span="9"
                  ><span class="propname">Input Index:</span>
                  {{ input.idx }}</el-col
                >
                <el-col :span="15"
                  ><span class="propname">Amount:</span>
                  {{ input.amount }}</el-col
                >
              </el-row>
              <el-row>
                <router-link
                  :to="`/address/${input.address}`"
                  class="address-link"
                >
                  <el-col :span="24"
                    ><span class="propname">From Address:</span>
                    {{ input.address }}</el-col
                  >
                </router-link>
              </el-row>
            </div>
          </div>
          <div class="transaction-outputs">
            <h4>Outputs:</h4>
            <div
              v-for="output in transaction.outputs"
              :key="output.idx"
              class="transaction-item"
            >
              <el-row>
                <el-col :span="9"
                  ><span class="propname">Output Index:</span>
                  {{ output.idx }}</el-col
                >
                <el-col :span="15"
                  ><span class="propname">Output Amount:</span>
                  {{ output.amount }}</el-col
                >
              </el-row>
              <el-row>
                <router-link
                  :to="`/address/${output.address}`"
                  class="address-link"
                >
                  <el-col :span="24"
                    ><span class="propname">To Address:</span>
                    {{ output.address }}</el-col
                  >
                </router-link>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import api from "../api/index";

export default {
  data() {
    return {
      block: null,
      isLoading: false,
      fullPage: false,
      loader: "bars",
    };
  },
  mounted() {
    this.fetchBlock();
  },
  methods: {
    // fetchBlock() {
    //   const height = this.$route.params.height;
    //   api.getTransactionTest(height)
    //     .then(response => {
    //       this.block = response.data.data[0];
    //     })
    //     .catch(error => {
    //       console.log(error);
    //     });
    // },
    fetchBlock() {
      this.isLoading = true;

      const height = this.$route.params.height;
      api
        .getTransaction(height)
        .then((response) => {
          this.block = response.data.data[0];
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.title {
  display: flex;
  align-items: center;
  width: 100%;
  height: 70px;
  text-align: left;
  box-sizing: border-box;
  background-color: #c6e2ff;
  padding: 5px;
  margin: 0;
  color: rgb(32, 41, 50);
  font-weight: bolder;
  font-family: "Courier New", Courier, monospace;
  font-size: 25px;
}
.Id {
  /* transaction id */
  padding: 10px;
  border-bottom: 2px dotted #91abe3;
  background-color: #f2f2f2;
}
.transaction {
  /* container transaction */
  display: flex;
  border: 3px solid white;
  border-bottom: 3px solid white;
  padding: 15px;
  color: rgb(2, 18, 242);
  background-color: #f2f2f2;
}
.transaction-item {
  border-bottom: 2px solid #c7c7c793;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.el-row {
  margin-bottom: 20px;
  border-bottom: 2px dotted #409eff;
  padding: 5px;
}
.propname {
  color: #140083;
  font-family: "Times New Roman", Times, serif;
  font-size: 18px;
  font-weight: bolder;
}

.transaction-inputs {
  flex: 45;
  padding-right: 5px;
}

.transaction-outputs {
  flex: 45;
  padding-left: 5px;
}
</style>
