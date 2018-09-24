import metatypeData from './data/metatypes';

const getMetatypes = function(category, metaPrio) {
  return metatypeData.chummer.metatypes.metatype.filter(metatype => ((metatype.category === category.name) && (metaPrio.allowedMetatypes.includes(metatype.name))));
};

export default getMetatypes;
