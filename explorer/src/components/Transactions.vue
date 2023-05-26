<!-- Transactions.vue -->
<!-- <h1>Transactions for Block {{ $route.params.height }}</h1> -->
  
<template>
    <HeaderTransaction/>
    <MainBodyTransaction/>
</template>

<script>
import HeaderTransaction from "../pages/HeaderTransaction.vue"
import MainBodyTransaction from "../pages/MainBodyTransaction.vue";

export default {
  components:{
    HeaderTransaction,
    MainBodyTransaction,
}
}

</script>
<style>
</style>