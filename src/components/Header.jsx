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
  constructor(props) {
    super();
  }

  componentDidMount = () => {
    this.props.getActivity();
  }

  render () {
    let activity = this.props.activity.length === 0 ? 
      this.props.fallbackActivity :
      this.props.activity

    console.log(activity);

    return (
      <div className="header">
        <div className="header-chart">
          <ResponsiveContainer>
            <AreaChart
              data={activity}
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
                type="basis" 
                dataKey="y" 
                stroke="#0054B4" 
                fill="url(#grad)" />
              <ReferenceDot
                x={19}
                y={activity[activity.length - 1].y}
                r={7.5} fill={'#0054B4'} stroke={'none'}
              >
                <Label
                  position={'right'}
                  content={<CustomLabel lines={[
                    '22 contributions',
                    'since April 8th'
                  ]} />}
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
  fallbackActivity: PropTypes.array,
  activity: PropTypes.array,
};

// prepare default data
let defaultData = []
for (let i = 0; i < 20; i++) {
  defaultData.push({ x: i, y: 1 })
}

Header.defaultProps = {
  fallbackActivity: defaultData,
};

const mapStateToProps = state => ({
  activity: state.activity.history,
})

const mapDispatchToProps = {
  getActivity,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
