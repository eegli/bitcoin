<template>
    <div class="mainbody">
        <el-button color="FFFFFF" type="primary" class="backbutton">
            <router-link to="/" class="back">Home</router-link>
        </el-button>
        <div class="blockdetail">
            <BlockDetail/>
            <TransactionList/>
        </div>
        
    </div>
</template>

<script>
import BlockDetail from './BlockDetail.vue';
import TransactionList from './TransactionsList.vue'

export default{
    components:{
    BlockDetail,
    TransactionList
}
}
</script>

<style scoped>
.mainbody{
    align-items: center;
    width:100%;
    border: 1px solid #000000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: #c6e2ff;
    min-height: 90vh;
}
</style>