<template>
  <div class="mainbody">
    <el-button color="FFFFFF" type="primary" class="backbutton">
      <router-link to="/" class="back">Home</router-link>
    </el-button>
    <div class="transaction">
      <AddressTransactions />
    </div>
  </div>
</template>

<script>
import AddressTransactions from "./AddressTransactions.vue";

export default {
  components: {
    AddressTransactions,
  },
};
</script>

<style scoped>
.mainbody {
  align-items: center;
  width: 100%;
  border: 1px solid #000000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #c6e2ff;
  min-height: 90vh;
}
</style>
