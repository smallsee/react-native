/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var  AsyncStorage= React.AsyncStorage;


//制作视频页面
var Edit = React.createClass({

    getInitialState(){
        return{
            user:{
                times:0
            }
        }
    },

    componentDidMount(){

        //批量存储
        // AsyncStorage.multiSet([['user1','1'],['user2','2']])
        //     .then(function(){
        //         console.log('save ok');
        //     })
        //批量获取
        // AsyncStorage.multiGet(['user1','user2','user'])
        //     .then(function(data){
        //         console.log(data);
        //         console.log(data[2]);
        //     })
        //批量删除
        AsyncStorage.multiRemove(['user1','user2'])
            .then(function(){
                console.log('删除chengg ')
            })

        // var user = that.state.user
        //
        // user.times++;
        // var userData = JSON.stringify(user);
        // //存储要用的值
        // AsyncStorage.setItem('user',userData)
        //     .then(function(){
        //         console.log('存储成功');
        //         that.setState({
        //             user:user})
        //     })
        //     .catch(function(err){
        //         console.log(err);
        //         console.log('存储失败');
        //     });


        // var that =this;
        // //获取存储值
        // AsyncStorage.getItem('user')
        //     .catch(function(err){
        //         console.log(err);
        //         console.log('存储失败');
        //     })
        //     .then(function(data){
        //
        //         console.log(data);
        //
        //         if (data){
        //             data = JSON.parse(data);
        //         }else{
        //             data = that.state.user;
        //         }
        //
        //
        //
        //         that.setState({
        //             user:data
        //         },function(){
        //
        //             data.times++;
        //             var userData = JSON.stringify(data);
        //
        //             AsyncStorage.setItem('user',userData)
        //                 .then(function(){
        //                     console.log('存储成功');
        //                 })
        //                 .catch(function(err){
        //                     console.log(err);
        //                     console.log('存储失败');
        //                 });
        //         });
        //     })

        //删除存储
        // AsyncStorage.removeItem('user')
        //     .then(function(){
        //         console.log('remove ok')
        //     })

    },

    render: function(){
        return (
            <View style={styles.container}>
                <Text style={[styles.item,styles.item1]}>小海,你好吗</Text>
                <View style={[styles.item,styles.item2]}>
                    <Text>小海二 ,我不好。</Text>
                </View>
                <View style={[styles.item,styles.item3]}>
                    <Text>{this.state.user.times}</Text>
                </View>
            </View>
        )
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1, //充满整个容器
        backgroundColor: '#ff6600',
        flexDirection:'row',  //设定排列方式 row 是横排  column 竖排
        paddingTop:30,
        paddingBottom:100,
        flexWrap:'nowrap', //一行超过了屏幕是否屏蔽超过的 wrap 把超过的一行换到底部,nowrap不操作
        justifyContent:'space-around', //与flexDirection的值有关, row的话就是横轴居中,column就是竖排居中
                                //还有flex-start 左对齐 flex-stop右对齐 space-between 两端对齐
                                //space-around 左边距加右边距等于中间隔开的边距

        alignItems:'center', //与flexDirection的值有关 ,row 的话 就是竖排居中 , column就是横排居中 还有flex-start  flex-stop
    },
    item1:{
        backgroundColor:'#ccc',
        // alignSelf:'flex-start',  //脱离父容器 靠自己的属性
    },
    item2:{
        backgroundColor:'#999',
       // alignSelf:'flex-end',
        //flex:1,   //把剩下空间坑满
    },
    item3:{
        backgroundColor:'#666',
       // alignSelf:'stretch',//拉伸 使得与父容器登高
        flex:1
    },
});

module.exports = Edit;