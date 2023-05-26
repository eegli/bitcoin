<template>
  <div class="title">
    Block Details
  </div>
  <div class="blockhash">
    <div v-if="block">
      {{block.hash}}
    </div>
  </div>
  <div class="blockDetail">
    <div v-if="block">
      <el-row>
        <el-col :span="8"><span class="propname">ID:</span> {{ block.id }}</el-col>
        <el-col :span="8"><span class="propname">Version:</span> {{ block.version }}</el-col>
        <el-col :span="8"><span class="propname">Block Size:</span> {{ block.blocksize }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><span class="propname">Previous Hash:</span> "{{ block.hashprev }}"</el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><span class="propname">Merkle Root:</span> "{{ block.hashmerkleroot }}"</el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><span class="propname">Time:</span> {{ formatTime(block.ntime) }}</el-col>
        <el-col :span="8"><span class="propname">Bits:</span> {{ block.nbits }}</el-col>
        <el-col :span="8"><span class="propname">Nonce:</span> {{ block.nnonce }}</el-col>
      </el-row>
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
      };
    },
    mounted() {
      this.fetchBlock();
    },
    methods: {
      fetchBlock() {
        const height = this.$route.params.height;
        api.getTransactionTest(height)
          .then(response => {
            this.block = response.data.data[0];
          })
          .catch(error => {
            console.log(error);
          });
      },
      formatTime(timestamp){
          // change the timestamp to the real time
          const data = new Date(timestamp * 1000);
          const formattedTime = data.toLocaleString();
          return formattedTime;
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
  text-align:left;
  box-sizing:border-box;
  background-color: #c6e2ff;
  padding: 5px;
  margin: 0;
  color:rgb(23, 26, 29);
  font-weight: bolder;
  font-family: 'Courier New', Courier, monospace;
  font-size: 25px;
}
.blockhash{
  padding-bottom: 20px;
}
.propname{
  color:#005ec3;
  font-family:'Times New Roman', Times, serif;
  font-size: 20px;
  font-weight: bolder;
}
.blockDetail {
  display: flex;
  width: 100%;
  text-align:left;
  box-sizing:border-box;
  background-color: #f2f2f2;
  border-radius: 20px;
  padding: 50px;
  margin: 0;
  color:rgb(88, 121, 239);
  font-family:'Times New Roman', Times, serif;
  font-size: 20px;
}
.el-row {
  margin-bottom: 20px;
  border-bottom: 2px dotted #409EFF;
  padding: 5px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

</style>