using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.MoreSystems.Hands;

public class Hand(Seat owner)
{
    public Seat Owner { get; } = owner;
    public List<Card> Cards { get; } = [];

    public void MoveCard(Card card, int index)
    {
        InHandComponent inHand = card.GetComponent<InHandComponent>();

        if (index > inHand.Index)
        {
            Cards.Insert(index, card);
            Cards.RemoveAt(inHand.Index);
        }
        else
        {
            Cards.RemoveAt(inHand.Index);
            Cards.Insert(index, card);
        }

        // TODO нормально сделай ептыть
        for (int i = 0; i < Cards.Count; i++)
        {
            Cards[i].GetComponent<InHandComponent>().Index = i;
        }
    }

    /// <summary>
    /// Меняет местами карты в коллекции, свапает индексы.
    /// </summary>
    /// <param name="card1"></param>
    /// <param name="card2"></param>
    public void SwapCards(Card card1, Card card2)
    {
        InHandComponent inHand1 = card1.GetComponent<InHandComponent>();
        InHandComponent inHand2 = card2.GetComponent<InHandComponent>();

        (inHand1.Index, inHand2.Index) = (inHand2.Index, inHand1.Index);

        Cards[inHand1.Index] = card1;
        Cards[inHand2.Index] = card2;
    }

    /// <summary>
    /// Добавляет карту в коллекцию и двигает индекс следующих карт.
    /// </summary>
    /// <param name="card"></param>
    /// <param name="index"></param>
    public void InsertCard(Card card, int index)
    {
        Cards.Insert(index, card);
        foreach (Card nextCard in Cards.Skip(index + 1))
        {
            nextCard.GetComponent<InHandComponent>().Index++;
        }
    }

    /// <summary>
    /// Убирает карту из коллекции и двигает индекс следующих карт.
    /// </summary>
    /// <param name="card"></param>
    public void RemoveCard(Card card)
    {
        int index = Cards.IndexOf(card);
        if (index == -1)
            return;

        Cards.RemoveAt(index);
        foreach (Card nextCard in Cards.Skip(index))
        {
            nextCard.GetComponent<InHandComponent>().Index--;
        }
    }
}