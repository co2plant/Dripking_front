const detailRouteNamesByItemType = {
  ALCOHOL: 'alcoholDetail',
  DESTINATION: 'destinationDetail',
  DISTILLERY: 'distilleryDetail',
}

const getTargetId = (item) => item?.targetId ?? item?.id

export const getDetailRouteForItem = (item) => {
  const itemType = String(item?.itemType || '').toUpperCase()
  const routeName = detailRouteNamesByItemType[itemType]
  const targetId = getTargetId(item)

  if (!routeName || targetId == null) {
    return null
  }

  return {
    name: routeName,
    params: {id: targetId},
  }
}
