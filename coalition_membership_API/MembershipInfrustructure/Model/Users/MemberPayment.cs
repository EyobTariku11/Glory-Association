using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Users
{
    public class MemberPayment : WithIdModel
    {
        public Guid MemberId { get; set; }
        public virtual Member Member { get; set; } = null!;
        public string TransactionReference { get; set; } = null!;
        public string PaymentUrl { get; set; } = null!;
        public double Amount { get; set; }
        
        public Guid MembershipTypeId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime LastPaidDate { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public bool IsPaid { get; set; } = false;
    }

    public enum PaymentStatus { PENDING, PAID, EXPIRED }
}
