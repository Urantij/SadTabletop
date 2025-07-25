namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Список объектов, которые либо представлены внутри, либо нет.
/// Список может включать в себя все объекты кроме указанных. Или никакие кроме указанных.
/// </summary>
public class Spisok<T>
    where T : class?
{
    // TODO сериализовать

    // Если вайтлист, все в листе инклудед.
    // Если не вайтлист, все в листе не инклудед.
    private readonly List<T> _list = [];
    private readonly bool _white;

    public Spisok(bool white)
    {
        _white = white;
    }

    public static Spisok<T> CreateNoOneWithIncluded(T included)
    {
        Spisok<T> spisok = new(true);
        spisok._list.Add(included);

        return spisok;
    }

    public static Spisok<T> CreateAllWithExcluded(T excluded)
    {
        Spisok<T> spisok = new(false);
        spisok._list.Add(excluded);

        return spisok;
    }

    public void AddToInclude(T target)
    {
        if (!_white)
        {
            _list.Remove(target);
        }
        else if (!_list.Contains(target))
        {
            _list.Add(target);
        }
    }

    public void RemoveFromInclude(T target)
    {
        if (_white)
        {
            _list.Remove(target);
        }
        else if (!_list.Contains(target))
        {
            _list.Add(target);
        }
    }

    /// <summary>
    /// Включен ли предмет в список
    /// </summary>
    /// <param name="item"></param>
    /// <returns></returns>
    public bool Included(T item)
    {
        if (_white)
            return _list.Contains(item);

        return !_list.Contains(item);
    }

    /// <summary>
    /// Есть ли в списке кто-то.
    /// Если список White, это значит, что кто то включен.
    /// Если список Black, это значит, что кто то выключен.
    /// </summary>
    /// <returns></returns>
    public bool IsListEmpty()
    {
        return _list.Count != 0;
    }
}