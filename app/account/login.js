/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5
import Button from 'react-native-button';

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var CountDown = require('react-native-sk-countdown').CountDownText;
var request = require('../common/request');
var config = require('../common/config');

var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var AsyncStorage= React.AsyncStorage;
var TextInput = React.TextInput;
var AlertIOS = React.AlertIOS;



//制作视频页面
var Login = React.createClass({

        getInitialState(){
            return{
                phoneNumber:'',
                verifyCode:'',
                codeSent:false,
                countingDone:false
            }
        },
    _showVerifyCode(){
        this.setState({
            codeSent:true
        })
    },
    _countingDone(){
        this.setState({
            countingDone:true
        })
    },


    _sendVerifyCode(){

        var that = this;
        var phoneNumber = this.state.phoneNumber;
        if (!phoneNumber){
            return AlertIOS.alert('手机号不好能为空!');
        }

        var signupURL = config.api.base + config.api.signup;

        var body ={
            phoneNumber : phoneNumber
        }

        request.post(signupURL,body)
            .then((data)=>{
                if (data && data.success){
                    that._showVerifyCode()
                }else{
                    AlertIOS.alert('获取验证码失败!请检查手机是否正确');
                }
            })
            .catch((err)=>{
                AlertIOS.alert('获取验证码失败,请检查网络是否良好!');
            })

    },

    _submit(){
        var that = this;
        var phoneNumber = this.state.phoneNumber;
        var verifyCode = this.state.verifyCode;
        if (!phoneNumber || !verifyCode){
            return AlertIOS.alert('手机号不好能为空!');
        }

        var verifyURL = config.api.base + config.api.verify;

        var body ={
            phoneNumber : phoneNumber,
            verifyCode : verifyCode
        }

        request.post(verifyURL,body)
            .then((data)=>{
                if (data && data.success){
                   that.props.afterLogin(data.data); //把数据从传递到上层
                }else{
                    AlertIOS.alert('获取验证码失败!请检查手机是否正确');
                }
            })
            .catch((err)=>{
                AlertIOS.alert('获取验证码失败,请检查网络是否良好!');
            })
    },


    render: function(){
        return (
            <View style={styles.container}>
                <View style={styles.signupBox}>
                    <Text style={styles.title}>快速登录</Text>
                    <TextInput
                        placeholder='请输入手机号'
                        autoCaptialize={'none'} //不去纠正大小写
                        autoCorrect={false} //不去纠正对与错
                        keyboradType={'number-pad'} //键盘
                        style={styles.inputField}
                        onChangeText={(text)=>{
                            this.setState({
                                phoneNumber:text,
                            })
                        }}
                    />

                    {
                        this.state.codeSent
                        ? <View style={styles.verifyCodeBox}>
                            <TextInput
                                placeholder='输入验证码'
                                autoCaptialize={'none'} //不去纠正大小写
                                autoCorrect={false} //不去纠正对与错
                                keyboardType={'number-pad'} //键盘
                                style={styles.inputField}
                                onChangeText={(text)=>{
                                    this.setState({
                                        verifyCode:text,
                                    })
                                }}
                                />

                                {
                                    this.state.countingDone
                                    ? <Button style={styles.countBtn}
                                              onPress={this._sendVerifyCode}
                                    >获取验证码</Button>
                                    :   <CountDown style={styles.countBtn}
                                                   countType='seconds' // 计时类型：seconds / date
                                                   auto={true} // 自动开始
                                                   afterEnd={this._countingDone} // 结束回调
                                                   timeLeft={60} // 正向计时 时间起点为0秒
                                                   step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                                   startText='获取验证码' // 开始的文本
                                                   endText='获取验证码' // 结束的文本
                                                   intervalText={(sec) => '剩余秒数:' + sec } // 定时的文本回调


                                    />
                                }

                        </View>
                        :
                            null

                    }

                    {
                        this.state.codeSent
                        ? <Button style={styles.btn}
                                  onPress={this._submit}
                                  buttonType="info">
                            登录
                            </Button>
                        :   <Button style={styles.btn}
                                    onPress={this._sendVerifyCode}>
                            获取验证码
                        </Button>
                    }
                </View>
            </View>
        )
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:10,
        backgroundColor:'#f9f9f9'
    },
    signupBox:{
        marginTop:30
    },
    title:{
        marginBottom:20,
        color:'#333',
        textAlign:'center',
        fontSize:20
    },
    inputField:{
        flex:1,
        height:40,
        padding:5,
        color:'#666',
        fontSize:16,
        backgroundColor:'#fff',
        borderRadius:4
    },
    verifyCodeBox:{
      marginTop:10,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    countBtn:{
        width:110,
        height:40,
        padding:10,
        marginLeft:8,
        color:'#fff',
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        textAlign:'left',
        fontWeight:'500',
        fontSize:15,
        borderRadius:2
    },
    btn:{
        padding:10,
        marginTop:10,
        backgroundColor:'transparent',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#ee735c'
    }

});

module.exports = Login;