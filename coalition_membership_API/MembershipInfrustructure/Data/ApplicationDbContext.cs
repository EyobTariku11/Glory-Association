using MembershipInfrustructure.Model.Authentication;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Coalition;
using MembershipInfrustructure.Model.Users;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.Donation;
using MembershipInfrustructure.Model.ETicket;
using MembershipInfrustructure.Model.Message;
using MembershipInfrustructure.Model.Events;
using MembershipInfrustructure.Model.News;
using MembershipInfrustructure.Model.Sponsor;
using MembershipInfrustructure.Model.Advertisement;

namespace MembershipInfrustructure.Data
{

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }

        #region configuration
        
        public DbSet<Region> Regions { get; set; }

        public DbSet<Zone> Zones { get; set; }
        
        public DbSet<GeneralCodes> GeneralCodes { get; set; }

        public DbSet<MembershipType> MembershipTypes { get; set; }
        
        public DbSet<ContactUs> ContactUs { get; set; }
        
        public DbSet<CompanyProfile> CompanyProfiles { get; set; }


        #endregion


        #region Users

        public DbSet<CoalitionModel> Coalition { get; set; }

        public DbSet<AssociationModel> Associations { get; set; }
        
        public DbSet<Member> Members { get; set; }
        public DbSet<MemberPayment> MemberPayments { get; set; }
        
        public DbSet<BoardMember> BoardMembers { get; set; }
        
      
        public DbSet<DonationEvent> DonationEvents { get; set; }
        public DbSet<DonationEventDetail> DonationEventDetails { get; set; }
        
        // Events system
        public DbSet<AssociationEvent> AssociationEvents { get; set; }
        public DbSet<EventDonation> EventDonations { get; set; }
        public DbSet<DonationTarget> DonationTargets { get; set; }
        public DbSet<News> News { get; set; } // Added
        public DbSet<Sponsor> Sponsors { get; set; } // Added
        
        public DbSet<Advertisement> Advertisements { get; set; } // Added
        
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageMember> MessageMembers { get; set; }
        
     

        public DbSet<Event> ETicketEvents { get; set; }
        public DbSet<ETicketModel> ETickets { get; set; } 
        
        


        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Member>()
               .HasIndex(b => b.PhoneNumber).IsUnique();


            modelBuilder.Entity<IdentityUserLogin<string>>(entity =>
            {
                entity.HasKey(l => new { l.LoginProvider, l.ProviderKey });
            });
            modelBuilder.Entity<IdentityUserRole<string>>(entity =>
            {
                entity.HasKey(r => new { r.UserId, r.RoleId });
            });
            modelBuilder.Entity<IdentityUserToken<string>>(entity =>
            {
                entity.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
            });



      

            modelBuilder.Entity<Member>()
     .Property(m => m.RegionId)
     .IsRequired(false);



        }
    }
}

