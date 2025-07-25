// using SadTabletop.Shared.Systems.Seats;
//
// namespace SadTabletop.Shared.Mechanics;
//
// public class LimitedProperty
// {
//     public Spisok<Seat?> Viewers { get; }
// }
//
// /// <summary>
// /// Информация, которая представлена по-разному в зависимости от того, кто на неё смотрит.
// /// Пример - карты, чьё лицо ты не видишь, если они в руках.
// /// </summary>
// public class LimitedProperty<T> : LimitedProperty
// {
//     /// <summary>
//     /// Настоящее значение информации.
//     /// </summary>
//     public T? Information { get; set; }
//
//     public T? Look(Seat? viewer)
//     {
//         if (Viewers.Included(viewer))
//             return Information;
//
//         return default;
//     }
// }