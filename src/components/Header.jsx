import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer, AreaChart, Area, ReferenceDot, XAxis, Label
} from 'recharts';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import OnVisible from 'react-on-visible';
import CustomLabel from './CustomLabel';
import { getActivity } from '../actions';
import './stylesheets/Header.scss';

import profile from '../media/profile-web.jpeg';
import profileWebp from '../media/profile-web.webp';

class Header extends PureComponent { 
  constructor(_props) {
    super();
  }

  componentDidMount = () => {
    this.props.getActivity();
  }

  render() {
    return (
      <div className={`header ${isMobile ? 'mobile' : ''}`}>
        <OnVisible className="header-chart">
          <ResponsiveContainer>
            <AreaChart
              data={this.props.activity.map(d => ({...d, y: d.y + 5}))}
              baseValue={0.12}
              margin={{
                top: 20,
                right: isMobile ? 140 : 170,
                bottom: 10,
                left: 0,
              }}
            >
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type='basis'
                dataKey='y'
                stroke={this.props.activity[0].y === 0 ? 'transparent' : this.props.darkMode ? 'rgb(96, 182, 255)' : '#0054B4'}
                fill='url(#grad)' />
              <ReferenceDot
                className={`header-chart-refdot ${this.props.activity[0].y === 0 ? 'hidden' : ''}`}
                x={this.props.activity.length - 1}
                y={this.props.activity[this.props.activity.length - 1].y + 5}
                r={7.5} fill={this.props.darkMode ? 'rgb(96, 182, 255)' : '#0054B4'} stroke={'none'}
              >
                <Label
                  position={'right'}
                  content={
                    <CustomLabel 
                      lines={this.props.activity[0].y !== 0 ?
                        [
                          `${this.props.activity.reduce((sum, val) => sum + val.y, 0)} contributions`,
                          `since ${this.props.activity[4].name}`
                        ] :
                        [
                          'Loading activity...'
                        ]
                      }
                      mobile={isMobile}
                      darkMode={this.props.darkMode}
                    />
                  }
                />
              </ReferenceDot>
              <XAxis 
                dataKey='name'
                axisLine={false}
                tickLine={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </OnVisible>
        <div className="header-box">
          <picture className="header-pic">
            <source srcSet={profileWebp} type="image/webp" />
            <source srcSet={profile} type="image/jpeg" />
            <img src={profile} alt="Self-Portrait" />
          </picture>
          <div className="header-title">
            <div className="header-title-main">
              Jai K. Smith
            </div>
            <div className="header-title-sub">
              Software Engineer, Dartmouth Undergrad<br />
              <i>New York, NY</i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  activity: PropTypes.array,
};

const mapStateToProps = state => ({
  activity: isMobile ? state.activity.history.slice(5) : state.activity.history,
})

const mapDispatchToProps = {
  getActivity,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
