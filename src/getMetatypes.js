import metatypeData from './data/metatypes';

const getMetatypes = function(category, metaPrio, demands) {
  const excludes = demands.getDemandValues('excludes', 'metatype');
  const requires = demands.getDemandValues('requires', 'metatype');

  return metatypeData.chummer.metatypes.metatype.filter(metatype => (
    (metatype.category === category.name) &&
    (metaPrio.allowedMetatypes.includes(metatype.name)) &&
    (! excludes.includes(metatype.name)) &&
    ((requires.length === 0) || requires.includes(metatype.name))
  ));
};

export default getMetatypes;
