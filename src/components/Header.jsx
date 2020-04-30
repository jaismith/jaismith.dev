import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  NavLink, withRouter
} from 'react-router-dom';
import './Header.scss';
import {
  ResponsiveContainer, AreaChart, Area, ReferenceDot, XAxis, Label
} from 'recharts';
import { connect } from 'react-redux';
import CustomLabel from './CustomLabel';
import { getActivity } from '../actions';

import profile from '../media/profile.jpeg';

class Header extends PureComponent { 
  constructor(_props) {
    super();
  }

  componentDidMount = () => {
    this.props.getActivity();
  }

  render() {
    return (
      <div className="header">
        <div className="header-chart">
          <ResponsiveContainer>
            <AreaChart
              data={this.props.activity}
              baseValue={0.12}
              margin={{
                top: 20,
                right: 170,
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
                stroke={this.props.activity[0].y === 0 ? 'transparent' : '#0054B4'}
                fill='url(#grad)' />
              <ReferenceDot
                className={`header-chart-refdot ${this.props.activity[0].y === 0 ? 'hidden' : null}`}
                x={this.props.activity.length - 1}
                y={this.props.activity[this.props.activity.length - 1].y}
                r={7.5} fill={'#0054B4'} stroke={'none'}
              >
                <Label
                  position={'right'}
                  content={<CustomLabel lines={this.props.activity[0].y !== 0 ?
                    [
                      `${this.props.activity.reduce((sum, val) => sum + (val.y - 5), 0)} contributions`,
                      `since ${this.props.activity[4].name}`
                    ] :
                    [
                      'Loading activity...'
                    ]
                  } />}
                />
              </ReferenceDot>
              <XAxis 
                dataKey='name'
                axisLine={false}
                tickLine={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="header-box">
          <img
            className="header-pic"
            src={profile}
            alt="Self-Portrait"
          />
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
        <div className="header-nav">
          <div className="header-active-highlight" />
          <NavLink 
            className="header-nav-item"
            activeClassName="selected"
            to='/projects'>
            Projects
          </NavLink>
          <NavLink
            className="header-nav-item"
            activeClassName="selected"
            to='/resume'>
            Resume
          </NavLink>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  activity: PropTypes.array,
};

const mapStateToProps = state => ({
  activity: state.activity.history,
})

const mapDispatchToProps = {
  getActivity,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
