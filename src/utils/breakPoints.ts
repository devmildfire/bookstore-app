const cutoff = 820;

const breakPoints = {
  sm: 'screen  and (max-width: 576px)',
  md: 'screen  and (max-width: 830px)',
  lg: 'screen  and (max-width: 1024px)',
  xl: 'screen  and (max-width: 1440px)',
  co2: `screen  and (max-width: ${cutoff - 2}px)`,
  co3: `screen  and (max-width: ${cutoff - 3}px)`,
  com1: `screen  and (min-width: ${cutoff - 1}px)`,
  com2: `screen  and (min-width: ${cutoff - 2}px)`,
  comp1: `screen  and (min-width: ${cutoff + 1}px)`,
};

export default breakPoints;
