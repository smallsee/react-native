/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//ES5

var React = require('react-native');
var Icon = require('react-native-vector-icons/Ionicons');
var Component = React.Component;
var AppRegistry = React.AppRegistry;
var StyleSheet = React.StyleSheet;
var Text = React.Text;
var View = React.View;
var TabBarIOS = React.TabBarIOS;



//列表页面
var List = require('./app/creation/index');
var Edit = require('./app/edit/index');
var Account = require('./app/account/index');




var xiaohai = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: 'list',
    };
  },

render() {
  return (
      <TabBarIOS
          tintColor="#ee735c"
          >
        <Icon.TabBarItem
            renderAsOriginal = {true}
            iconName='ios-videocam-outline'
            selectedIconName='ios-videocam'
            selected={this.state.selectedTab === 'list'}
            onPress={() => {
              this.setState({
                selectedTab: 'list',
              });
            }}>
            <List />
        </Icon.TabBarItem>
          <Icon.TabBarItem
              renderAsOriginal = {true}
              iconName='ios-recording-outline'
              selectedIconName='ios-recording'
              selected={this.state.selectedTab === 'edit'}
              onPress={() => {
                  this.setState({
                      selectedTab: 'edit',
                  });
              }}>
              <Edit />
          </Icon.TabBarItem>
          <Icon.TabBarItem
              renderAsOriginal = {true}
              iconName='ios-more-outline'
              selectedIconName='ios-more'
              selected={this.state.selectedTab === 'account'}
              onPress={() => {
                  this.setState({
                      selectedTab: 'account',
                  });
              }}>
              <Account />
          </Icon.TabBarItem>


      </TabBarIOS>
  );
},

});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

AppRegistry.registerComponent('xiaohai', () => xiaohai);
